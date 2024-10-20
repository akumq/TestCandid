let isSubtitlePlaying = false;

// Function to parse SRT file content
function parseSrt(srtContent) {
    const lines = srtContent.split('\n');
    const subtitles = [];
    let subtitle = {};
  
    for (let line of lines) {
      line = line.trim();
  
      if (line.match(/^\d+$/)) {
        // New subtitle
        if (subtitle.id) {
          subtitles.push(subtitle);
        }
        subtitle = { id: parseInt(line) };
      } else if (line.match(/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/)) {
        // Timestamps
        const [start, end] = line.split(' --> ');
        subtitle.start = parseTimestamp(start);
        subtitle.end = parseTimestamp(end);
      } else if (line !== '') {
        // Text
        if (subtitle.text) {
          subtitle.text += '\n' + line;
        } else {
          subtitle.text = line;
        }
      }
    }
  
    if (subtitle.id) {
      subtitles.push(subtitle);
    }
  
    return subtitles;
}
  
// Function to parse timestamp string to milliseconds
function parseTimestamp(timestamp) {
    const [time, milliseconds] = timestamp.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000 + parseInt(milliseconds);
}

// Function to display subtitle at a given time
function displaySubtitle(subtitles, currentTime) {
    const subtitle = subtitles.find(
      (s) => s.start <= currentTime && s.end >= currentTime
    );
  
    if (subtitle) {
      $('#sub_text').text(subtitle.text);
      isSubtitlePlaying = true;
    } else {
      // Keep the last subtitle displayed until the next one starts
      if (isSubtitlePlaying) {
        const nextSubtitle = subtitles.find((s) => s.start > currentTime);
        if (!nextSubtitle || nextSubtitle.start > currentTime + 100) {
          $('#sub_text').text('');
          isSubtitlePlaying = false;
        }
      }
    }
  }
  
// Load SRT file and display subtitles on click
let subtitles = [];
let startTime = null;
let intervalId = null;

fetch('ressource/srt/example.srt')
    .then((response) => response.text())
    .then((srtContent) => {
        subtitles = parseSrt(srtContent);

        // Start subtitles on click
        document.addEventListener('click', () => {
        if (!startTime) {
            startTime = Date.now();
            intervalId = setInterval(() => {
            const currentTime = Date.now() - startTime;
            displaySubtitle(subtitles, currentTime);

            // Stop subtitles after the last subtitle has been displayed
            if (currentTime >= subtitles[subtitles.length - 1].end) {
                clearInterval(intervalId);
                startTime = null;
                intervalId = null;
                isSubtitlePlaying = false;
            }
            }, 100);
        }
        });
});
  