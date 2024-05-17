function updateFileList(url, selectorId, fileExtensions) {
    fetch(url)
      .then(response => response.json())
      .then(files => {
        const fileSelector = document.getElementById(selectorId);
        fileSelector.innerHTML = ''; // Clear the existing options
  
        files.forEach(file => {
          if (fileExtensions.length === 0 || fileExtensions.some(ext => file.endsWith(ext))) {
            const option = document.createElement('option');
            option.value = file;
            option.textContent = file;
            fileSelector.appendChild(option);
          }
        });
      });
  }

  document.addEventListener('DOMContentLoaded', function() {

    // Refresh button event listeners
    document.getElementById('RefreshSubtitleListBtn').addEventListener('click', function() {
      updateFileList('/subtitlefilelist', 'SubtitlefileSelector', ['.subtitles.txt']);
    });
  
    document.getElementById('RefreshAudioListBtn').addEventListener('click', function() {
      updateFileList('/audiofilelist', 'AudiofileSelector', ['.wav', '.mp3', '.ogg']); // Specify the audio file extensions
    });
  
    document.getElementById('RefreshAudioListBtn2').addEventListener('click', function() {
      updateFileList('/audiofilelist2', 'AudiofileSelector2', ['.wav', '.mp3', '.ogg']); // Specify the audio file extensions
    });
  
    document.getElementById('RefreshSmallsegmentListBtn').addEventListener('click', function() {
      updateFileList('/smallsegmentfilelist', 'SmallsegmentfileSelector', ['.smallsegment.matched.json']);
    });
  
    document.getElementById('RefreshBigsegmentListBtn').addEventListener('click', function() {
      updateFileList('/bigsegmentfilelist', 'BigsegmentfileSelector', ['.bigsegment.matched.json']);
    });
  
    document.getElementById('RefreshRegiondataListBtn').addEventListener('click', function() {
      updateFileList('/regiondatafilelist', 'RegiondatafileSelector', ['.regionData.json']);
    });
  });