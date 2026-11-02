import html2canvas from 'html2canvas';
import { featureCollection } from '@turf/helpers';

/**
 * Exporte la carte en PNG en utilisant html2canvas
 * @param {HTMLElement} mapContainer - Conteneur de la carte
 * @param {string} filename - Nom du fichier (sans extension)
 */
export const exportMapToPNG = async (mapContainer, filename = 'carte') => {
  try {
    if (!mapContainer) {
      throw new Error('Conteneur de carte non disponible');
    }

    const canvas = await html2canvas(mapContainer, {
      useCORS: true,
      allowTaint: false,
      scale: 2,
      width: mapContainer.offsetWidth,
      height: mapContainer.offsetHeight,
      backgroundColor: '#ffffff'
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Impossible de créer le blob PNG'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    });
  } catch (error) {
    console.error('Erreur lors de l\'export PNG:', error);
    throw error;
  }
};

/**
 * Exporte les couches vectorielles actives en GeoJSON
 * @param {Array} activeLayers - Couches actives
 * @param {Object} layers - Toutes les données des couches
 * @param {string} filename - Nom du fichier (sans extension)
 */
export const exportLayersToGeoJSON = (activeLayers, layers, filename = 'couches') => {
  try {
    const features = [];

    activeLayers.forEach(layer => {
      const layerKey = layer.layerKey || layer;
      const layerData = layer.data || layers[layerKey];

      if (layerData && layerData.features) {
        layerData.features.forEach(feature => {
          features.push({
            ...feature,
            properties: {
              ...feature.properties,
              sourceLayer: layerKey
            }
          });
        });
      }
    });

    if (features.length === 0) {
      throw new Error('Aucune couche vectorielle active à exporter');
    }

    const geoJsonData = featureCollection(features);
    const dataStr     = JSON.stringify(geoJsonData, null, 2);
    const dataBlob    = new Blob([dataStr], { type: 'application/json' });
    const url         = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Erreur lors de l\'export GeoJSON:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Export PNG via capture d'écran native (Screen Capture API)
//
// Avantages par rapport à html2canvas :
//   - Rendu pixel-perfect (ce que l'utilisateur voit réellement)
//   - Pas de problème de CORS avec les tuiles raster
//   - Respecte les filtres, opacités et superpositions CSS
//
// Contrainte : nécessite Chrome 94+ / Edge 94+.
//   Le navigateur affiche une popup de partage — l'utilisateur doit
//   sélectionner "l'onglet actuel".
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exporte le conteneur de la carte en PNG via capture d'écran native.
 * @param {HTMLElement} mapContainer - Le div contenant la carte Leaflet
 * @param {string}      filename     - Nom du fichier sans extension
 * @returns {Promise<void>}
 */
export const exportMapAsScreenshot = async (mapContainer, filename = 'carte') => {
  if (!mapContainer) {
    throw new Error('Conteneur de carte introuvable.');
  }

  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error(
      'La capture d\'écran native n\'est pas supportée par ce navigateur. ' +
      'Utilisez Chrome 94+ ou Edge 94+.'
    );
  }

  let stream = null;

  try {
    // 1. Demander la capture de l'onglet actuel
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'never',
        displaySurface: 'browser',
      },
      audio: false,
      preferCurrentTab: true,       // Chrome 94+ : pré-sélectionne l'onglet courant
      selfBrowserSurface: 'include', // Autorise la capture de l'onglet lui-même
    });

    // const videoTrack = stream.getVideoTracks()[0];

    // 2. Lire une frame via un élément <video>
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;

    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
    });

    await video.play();

    // Attendre que la première frame soit peinte
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    // 3. Dessiner la frame complète sur un canvas
    const fullCanvas   = document.createElement('canvas');
    fullCanvas.width   = video.videoWidth;
    fullCanvas.height  = video.videoHeight;
    fullCanvas.getContext('2d').drawImage(video, 0, 0);

    // Arrêter immédiatement le stream — on n'a besoin que d'une seule frame
    stream.getTracks().forEach((t) => t.stop());
    stream = null;

    // 4. Calculer la zone exacte du conteneur carte dans l'image capturée
    //
    //    getBoundingClientRect() retourne les coordonnées CSS (indépendantes du DPR).
    //    On calcule le ratio entre la taille de la vidéo capturée et la fenêtre CSS
    //    pour retrouver les coordonnées pixel dans l'image.
    //
    const rect   = mapContainer.getBoundingClientRect();
    const scaleX = video.videoWidth  / window.innerWidth;
    const scaleY = video.videoHeight / window.innerHeight;

    const cropX = Math.round(rect.left   * scaleX);
    const cropY = Math.round(rect.top    * scaleY);
    const cropW = Math.round(rect.width  * scaleX);
    const cropH = Math.round(rect.height * scaleY);

    // 5. Recadrer sur le conteneur de la carte
    const croppedCanvas        = document.createElement('canvas');
    croppedCanvas.width        = cropW;
    croppedCanvas.height       = cropH;
    croppedCanvas.getContext('2d').drawImage(
      fullCanvas,
      cropX, cropY, cropW, cropH,
      0,     0,    cropW, cropH
    );

    // 6. Télécharger le PNG
    await _downloadCanvas(croppedCanvas, filename);

  } catch (err) {
    if (stream) stream.getTracks().forEach((t) => t.stop());

    // Annulation volontaire de l'utilisateur → sortie silencieuse
    if (err.name === 'NotAllowedError' || err.name === 'AbortError') return;

    throw err;
  }
};

/** @private Canvas → téléchargement PNG */
const _downloadCanvas = (canvas, filename) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Impossible de générer l\'image.')); return; }
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exporte la carte selon le format choisi.
 * @param {string}      format       - 'png' | 'screenshot' | 'geojson'
 * @param {HTMLElement} mapContainer - Conteneur de la carte
 * @param {Array}       activeLayers - Couches actives
 * @param {Object}      layers       - Données des couches
 * @param {string}      filename     - Nom du fichier
 */
export const exportMap = async (format, mapContainer, activeLayers, layers, filename) => {
  switch (format.toLowerCase()) {
    case 'png':
      if (!mapContainer) throw new Error('Conteneur de carte non disponible pour l\'export PNG');
      return await exportMapToPNG(mapContainer, filename);

    case 'screenshot':
      if (!mapContainer) throw new Error('Conteneur de carte non disponible pour la capture d\'écran');
      return await exportMapAsScreenshot(mapContainer, filename);

    case 'geojson':
      if (!activeLayers || !layers) throw new Error('Données des couches non disponibles pour l\'export GeoJSON');
      return exportLayersToGeoJSON(activeLayers, layers, filename);

    default:
      throw new Error(`Format d'export non supporté : ${format}`);
  }
};