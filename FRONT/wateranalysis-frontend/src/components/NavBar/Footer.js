import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
      
      {/* <img
        src="/logo/logoUF-removebg-preview.png"
        alt="LogoUF"
        className="h-12 w-auto object-contain opacity-80"
      /> */}

      <p className="text-xs text-gray-400 text-center max-w-ful leading-relaxed mx-auto">
        Water Network Analysis, a platform for mapping and analysing drinking-water infrastructure and spatial data — OREHM, Haute Matsiatra.
        <br />
        Université de Fianarantsoa &nbsp;|&nbsp; Madatlas &nbsp;|&nbsp; © {new Date().getFullYear()}
      </p>

      {/* <img
        src="/logo/logoMADATLAS-removebg-preview.png"
        alt="LogoMADATLAS"
        className="h-12 w-auto object-contain opacity-80"
      /> */}

    </footer>
  );
};

export default Footer;