import React, { useState, useEffect } from 'react';

type AppState = 'selection' | 'progress' | 'success';

const App: React.FC = () => {
    const [state, setState] = useState<AppState>('selection');
    const [filePath, setFilePath] = useState<string | null>(null);
    const [targetFolder, setTargetFolder] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [resultPath, setResultPath] = useState('');
    const [updateStatus, setUpdateStatus] = useState<'none' | 'available' | 'downloaded'>('none');
    const [preview, setPreview] = useState<{ original: string; padded: string } | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [dragActive, setDragActive] = useState(false);

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

    const generatePreview = async (path: string) => {
        setLoadingPreview(true);
        try {
            const result = await window.electronAPI.generatePreview(path);
            setPreview(result);
        } catch (error) {
            console.error('Preview error:', error);
            setPreview(null);
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleSelectFile = async () => {
        const path = await window.electronAPI.selectFile();
        if (path) {
            setFilePath(path);
            generatePreview(path);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            // @ts-ignore - Electron adds 'path' to File object
            const path = file.path;
            if (path) {
                setFilePath(path);
                generatePreview(path);
            }
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
        setPreview(null);
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
                        <div
                            className={`card ${dragActive ? 'drag-active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="input-group">
                                <label>Source Video</label>
                                <div className="file-picker-row">
                                    <button onClick={handleSelectFile} className="btn-secondary">Choose File</button>
                                    <span className="path-display" title={filePath || ''}>
                                        {filePath ? filePath.split('/').pop() : 'No file selected (or drag here)'}
                                    </span>
                                </div>
                            </div>

                            {filePath && (
                                <div className="preview-section">
                                    {loadingPreview ? (
                                        <div className="preview-loader-container">
                                            <div className="loader small"></div>
                                            <span>Generating preview...</span>
                                        </div>
                                    ) : preview ? (
                                        <div className="preview-grid">
                                            <div className="preview-item">
                                                <label>Before (Original)</label>
                                                <div className="preview-image-container checkerboard">
                                                    <img src={preview.original} alt="Before" />
                                                </div>
                                            </div>
                                            <div className="preview-icon">➜</div>
                                            <div className="preview-item">
                                                <label>After (Landscape)</label>
                                                <div className="preview-image-container padded">
                                                    <img src={preview.padded} alt="After" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}

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
