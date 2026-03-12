const btnSelectFile = document.getElementById('btn-select-file');
const btnSelectFolder = document.getElementById('btn-select-folder');
const btnConvert = document.getElementById('btn-convert');
const btnReset = document.getElementById('btn-reset');

const selectedFilePath = document.getElementById('selected-file-path');
const selectedFolderPath = document.getElementById('selected-folder-path');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const outputPathDisplay = document.getElementById('output-path');

const selectionState = document.getElementById('selection-state');
const progressState = document.getElementById('progress-state');
const successState = document.getElementById('success-state');

let filePath = null;
let targetFolder = null;

function updateConvertButton() {
    btnConvert.disabled = !(filePath && targetFolder);
}

btnSelectFile.addEventListener('click', async () => {
    const path = await window.electronAPI.selectFile();
    if (path) {
        filePath = path;
        selectedFilePath.textContent = path.split('/').pop();
        selectedFilePath.title = path;
        updateConvertButton();
    }
});

btnSelectFolder.addEventListener('click', async () => {
    const path = await window.electronAPI.selectFolder();
    if (path) {
        targetFolder = path;
        selectedFolderPath.textContent = path;
        selectedFolderPath.title = path;
        updateConvertButton();
    }
});

btnConvert.addEventListener('click', async () => {
    selectionState.classList.add('hidden');
    progressState.classList.remove('hidden');

    try {
        const resultPath = await window.electronAPI.startConversion({ filePath, targetFolder });

        progressState.classList.add('hidden');
        successState.classList.remove('hidden');
        outputPathDisplay.textContent = resultPath;
    } catch (error) {
        alert('Conversion failed: ' + error);
        selectionState.classList.remove('hidden');
        progressState.classList.add('hidden');
    }
});

btnReset.addEventListener('click', () => {
    filePath = null;
    selectedFilePath.textContent = 'No file selected';
    successState.classList.add('hidden');
    selectionState.classList.remove('hidden');
    updateConvertButton();
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
});

window.electronAPI.onProgress((percent) => {
    if (percent) {
        const rounded = Math.round(percent);
        progressFill.style.width = `${rounded}%`;
        progressText.textContent = `${rounded}%`;
    }
});
