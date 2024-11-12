export class VolumeManager {
    constructor() {
        if (VolumeManager.instance) {
            return VolumeManager.instance;
        }

        this.audioElements = {};
        this.maxVolumes = {};
        this.slider = null;

        VolumeManager.instance = this;
    }

    createAudio(src) {
        let audio = new Audio(src);
        this.audioElements[src] = audio;
        this.maxVolumes[src] = 1;

        if (this.slider) {
            audio.volume = this.slider.value * this.maxVolumes[src];
        }

        return audio;
    }

    setMaxVolume(src, volume) {
        if (this.audioElements[src]) {
            this.maxVolumes[src] = volume;

            if (this.slider) {
                this.audioElements[src].volume = this.slider.value * volume;
            }
        }
    }

    setSlider(slider) {
        this.slider = slider;

        this.slider.addEventListener('input', () => {
            for (let src in this.audioElements) {
                this.audioElements[src].volume = this.slider.value * this.maxVolumes[src];
            }
        });
    }

}

const volumeManager = new VolumeManager();
