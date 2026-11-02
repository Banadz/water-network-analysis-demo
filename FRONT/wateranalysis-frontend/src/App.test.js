import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./features/map/MapView', () => () => <div data-testid="map-view" />);

test('renders the Water Network Analysis interface', () => {
  render(<App />);
  expect(screen.getByText('WNA')).toBeInTheDocument();
});
