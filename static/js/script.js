document.addEventListener('DOMContentLoaded', function() {
    const wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'rgb(200, 0, 200)',
        progressColor: 'rgb(100, 0, 100)',
        url: '/static/audio/en_example.wav',
    });

    wavesurfer.on('click', () => {
        wavesurfer.play();
    });
});