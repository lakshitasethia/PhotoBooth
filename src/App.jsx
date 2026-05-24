import { useState } from 'react';
import LandingPage from './LandingPage';
import PhotoBooth from './PhotoBooth';
import PhotoStrip from './PhotoStrip';

function App() {
  const [view, setView] = useState('landing');
  const [photos, setPhotos] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [selectedTheme, setSelectedTheme] = useState('plain white');

  const handleOpenBooth = () => {
    setView('booth');
  };

  const handleSessionComplete = (capturedPhotos, filter) => {
    setPhotos(capturedPhotos);
    if (filter) {
      setSelectedFilter(filter);
    }
    setView('strip');
  };

  const handleRetake = () => {
    setPhotos([]);
    setView('booth');
  };

  const handleBackToLanding = () => {
    setView('landing');
    setPhotos([]);
    setSelectedFilter('none');
    setSelectedTheme('plain white');
  };

  return (
    <div className="app-container">
      {view === 'landing' && (
        <LandingPage onOpenBooth={handleOpenBooth} />
      )}
      {view === 'booth' && (
        <PhotoBooth 
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          onSessionComplete={handleSessionComplete}
          onBack={handleBackToLanding}
        />
      )}
      {view === 'strip' && (
        <PhotoStrip 
          photos={photos}
          selectedFilter={selectedFilter}
          selectedTheme={selectedTheme}
          onBack={handleBackToLanding}
          onRetake={handleRetake}
        />
      )}
    </div>
  );
}

export default App;
