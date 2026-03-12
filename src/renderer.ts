const btnSelectFile = document.getElementById('btn-select-file') as HTMLButtonElement;
const btnSelectFolder = document.getElementById('btn-select-folder') as HTMLButtonElement;
const btnConvert = document.getElementById('btn-convert') as HTMLButtonElement;
const btnReset = document.getElementById('btn-reset') as HTMLButtonElement;

const selectedFilePath = document.getElementById('selected-file-path') as HTMLSpanElement;
const selectedFolderPath = document.getElementById('selected-folder-path') as HTMLSpanElement;
const progressFill = document.getElementById('progress-fill') as HTMLDivElement;
const progressText = document.getElementById('progress-text') as HTMLSpanElement;
const outputPathDisplay = document.getElementById('output-path') as HTMLParagraphElement;

const selectionState = document.getElementById('selection-state') as HTMLDivElement;
const progressState = document.getElementById('progress-state') as HTMLDivElement;
const successState = document.getElementById('success-state') as HTMLDivElement;

let filePath: string | null = null;
let targetFolder: string | null = null;

function updateConvertButton() {
    btnConvert.disabled = !(filePath && targetFolder);
}

btnSelectFile.addEventListener('click', async () => {
    const path = await window.electronAPI.selectFile();
    if (path) {
        filePath = path;
        selectedFilePath.textContent = path.split('/').pop() || 'Unknown file';
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
    if (!filePath || !targetFolder) return;

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
    if (percent !== undefined) {
        const rounded = Math.round(percent);
        progressFill.style.width = `${rounded}%`;
        progressText.textContent = `${rounded}%`;
    }
});
