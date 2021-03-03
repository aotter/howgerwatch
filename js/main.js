$(document).ready(function () {

    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('imgs')) {
        const urls = searchParams.get('imgs').split(',').map(u => decodeURIComponent(u))
        $('#img1').val(urls[0] || "");
        $('#img2').val(urls[1] || "");
        $('#img3').val(urls[2] || "");
    }

    processor.doLoad();

    const defaultImg = 'https://via.placeholder.com/150/000000/000000'

    $('#form').submit((e) => {
        e.preventDefault();
        processor.video.currentTime = 0;
        processor.resetDoneFlags();
        const img1 = $('#img1').val();
        const img2 = $('#img2').val();
        const img3 = $('#img3').val();
        loadImages([defaultImg, (img1 || defaultImg), (img2 || defaultImg), (img3 || defaultImg)])
            .then(imgs => {
                processor.loadImg('p1', imgs[0]);
                processor.loadImg('p2', imgs[1]);
                processor.loadImg('p3', imgs[2]);
                processor.loadImg('p4', imgs[3]);
                processor.video.play();

                const v = [img1, img2, img3].map(e => encodeURIComponent(e)).join(',')
                setQueryStringParameter('imgs', v)
            });
    });

});

function setQueryStringParameter(name, value) {
    const params = new URLSearchParams(window.location.search);
    params.set(name, value);
    window.history.replaceState({}, "", decodeURIComponent(`${window.location.pathname}?${params}`));
}


let processor = {

    timerCallback: function () {
        if (this.video.paused || this.video.ended) {
            return;
        }
        this.computeFrame();
        let self = this;
        setTimeout(function () {
            self.timerCallback();
        }, 0);
    },

    doLoad: function () {
        this.video = document.getElementById("video");
        this.c1 = document.getElementById("c1");
        this.ctx1 = this.c1.getContext("2d");
        this.c2 = document.getElementById("c2");
        this.ctx2 = this.c2.getContext("2d");
        let self = this;
        this.video.addEventListener("play", function () {
            self.width = self.video.videoWidth;
            self.height = self.video.videoHeight;
            self.timerCallback();
        }, false);
    },

    loadImg: function (name, img) {
        this[name] = new Perspective(this.ctx2, img);
    },

    resetDoneFlags: function () {
        this.done1 = false;
        this.done2 = false;
        this.done3 = false;
        this.done4 = false;
    },

    screenPositions: [
        [398, 101],
        [595, 87],
        [594, 217],
        [398, 211]
    ],

    computeFrame: function () {
        this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);

        if (this.video.currentTime < 3.3 && !this.done1) {
            this.p1.draw(this.screenPositions);
            this.done1 = true
        }
        else if (this.video.currentTime >= 3.3 && this.video.currentTime < 5 && !this.done2) {
            this.p2.draw(this.screenPositions);
            this.done2 = true
        }
        else if (this.video.currentTime >= 5 && this.video.currentTime < 6.6 && !this.done3) {
            this.p3.draw(this.screenPositions);
            this.done3 = true
        }
        else if (this.video.currentTime >= 6.6 && !this.done4) {
            this.p4.draw(this.screenPositions);
            this.done4 = true
        }
        return;
    }

}


async function loadImages(imageUrlArray) {
    const promiseArray = []; // create an array for promises
    const imageArray = []; // array for the images

    for (let imageUrl of imageUrlArray) {

        promiseArray.push(new Promise(resolve => {

            const img = new Image();

            img.onload = function () {
                resolve();
            };

            img.src = imageUrl;
            imageArray.push(img);
        }));
    }

    await Promise.all(promiseArray);
    return imageArray;
}
