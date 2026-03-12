import React, { useState, useEffect } from 'react';

type AppState = 'selection' | 'progress' | 'success';

const App: React.FC = () => {
    const [state, setState] = useState<AppState>('selection');
    const [filePath, setFilePath] = useState<string | null>(null);
    const [targetFolder, setTargetFolder] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [resultPath, setResultPath] = useState('');

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

    return (
        <div className="app-container">
            <header>
                <div className="logo-container">
                    <img src="logo.png" alt="HandyMedia Logo" className="app-logo" />
                </div>
                <h1>HandyMedia</h1>
                <p>Your friendly media multi-tool</p>
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
