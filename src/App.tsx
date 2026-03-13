import React, { useState, useEffect } from 'react';

type AppState = 'selection' | 'progress' | 'success';

const App: React.FC = () => {
    const [state, setState] = useState<AppState>('selection');
    const [filePath, setFilePath] = useState<string | null>(null);
    const [targetFolder, setTargetFolder] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [resultPath, setResultPath] = useState('');
  const [updateStatus, setUpdateStatus] = useState<'none' | 'available' | 'downloaded'>('none');

  useEffect(() => {
    const unsubAvailable = window.electronAPI.onUpdateAvailable(() => setUpdateStatus('available'));
    const unsubDownloaded = window.electronAPI.onUpdateDownloaded(() => setUpdateStatus('downloaded'));
    return () => {
      if (typeof unsubAvailable === 'function') unsubAvailable();
      if (typeof unsubDownloaded === 'function') unsubDownloaded();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'u') {
        setUpdateStatus(prev => {
          if (prev === 'none') return 'available';
          if (prev === 'available') return 'downloaded';
          return 'none';
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

    useEffect(() => {
        const removeListener = window.electronAPI.onProgress((percent: number) => {
            if (percent !== undefined) {
                setProgress(Math.round(percent));
            }
        });
        return () => {
            if (typeof removeListener === 'function') {
                removeListener();
            }
        };
    }, []);

    const handleSelectFile = async () => {
        const path = await window.electronAPI.selectFile();
        if (path) {
            setFilePath(path);
        }
    };

    const handleSelectFolder = async () => {
        const path = await window.electronAPI.selectFolder();
        if (path) {
            setTargetFolder(path);
        }
    };

    const handleConvert = async () => {
        if (!filePath || !targetFolder) return;

        setState('progress');
        setProgress(0);

        try {
            const path = await window.electronAPI.startConversion({ filePath, targetFolder });
            setResultPath(path);
            setState('success');
        } catch (error) {
            alert('Conversion failed: ' + error);
            setState('selection');
        }
    };

    const handleReset = () => {
        setFilePath(null);
        setState('selection');
        setProgress(0);
    };

  const handleRestart = () => {
    window.electronAPI.restartApp();
  };

    return (
        <div className="app-container">
        {updateStatus !== 'none' && (
          <div className="update-notification">
            {updateStatus === 'available' ? (
              <span>✨ A new update is being downloaded...</span>
            ) : (
              <>
                <span>🚀 Update ready!</span>
                <button onClick={handleRestart} className="btn-update">Restart to Install</button>
              </>
            )}
          </div>
        )}
            <header>
                <div className="logo-container">
                  <img src="logo.png" alt="HandyMedia Logo" className="app-logo" />
                </div>
                <h1>HandyMedia</h1>
          <div className="tool-intro">
            <p>Bypass YouTube Shorts and convert vertical videos to landscape.</p>
            <p className="tool-usage">Adding pads to your portrait videos forces YouTube to treat them as regular videos rather than Shorts. Select your file, pick a destination, and stay in control of your uploads.</p>
          </div>
        </header>
            <main>
                {state === 'selection' && (
                    <div id="selection-state" className="state-container">
                        <div className="card">
                            <div className="input-group">
                                <label>Source Video</label>
                                <div className="file-picker-row">
                                    <button onClick={handleSelectFile} className="btn-secondary">Choose File</button>
                                    <span className="path-display" title={filePath || ''}>
                                        {filePath ? filePath.split('/').pop() : 'No file selected'}
                                    </span>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Target Folder</label>
                                <div className="file-picker-row">
                                    <button onClick={handleSelectFolder} className="btn-secondary">Choose Folder</button>
                                    <span className="path-display" title={targetFolder || ''}>
                                        {targetFolder || 'No folder selected'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleConvert}
                                className="btn-primary"
                                disabled={!filePath || !targetFolder}
                            >
                                Convert to Landscape
                            </button>
                        </div>
                    </div>
                )}

                {state === 'progress' && (
                    <div id="progress-state" className="state-container">
                        <div className="card centered">
                            <div className="loader"></div>
                            <h2>Converting...</h2>
                            <div className="progress-wrapper">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                </div>
                                <span id="progress-text">{progress}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {state === 'success' && (
                    <div id="success-state" className="state-container">
                        <div className="card centered">
                            <div className="success-icon">✓</div>
                            <h2>Conversion Complete!</h2>
                            <p id="output-path" className="path-display">{resultPath}</p>
                            <button onClick={handleReset} className="btn-primary">Convert Another File</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
