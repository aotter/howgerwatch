const defaultImg = 'https://via.placeholder.com/150/000000/000000'


$(document).ready(function () {

    processor.doLoad();

    // let searchParams = new URLSearchParams(window.location.search)
    // if (searchParams.has('imgs')) {
    //     const urls = searchParams.get('imgs').split(',').map(u => decodeURIComponent(u))
    //     $('#img1').val(urls[0] || "");
    //     $('#img2').val(urls[1] || "");
    //     $('#img3').val(urls[2] || "");

    //     // autoplay if any not blank
    //     if (urls[0] || urls[1] || urls[2]) {
    //         // fixme: should wait until video loaded 
    //         setTimeout(() => {
    //             play();
    //         }, 1000)

    //     }
    // }


    $('#form').submit((e) => {
        e.preventDefault();
        play();
    });

    function play() {
        processor.video.currentTime = 0;
        processor.resetDoneFlags();
        processor.gif = new GIF({
            width: 640,
            height: 360,
            workerScript: 'js/gif/gif.worker.js'
        });
        processor.gif.on('progress', function (p) {
            updateProgress(p * 100, '輸出 GIF')
        });
        processor.gif.on('finished', function (blob) {
            download(URL.createObjectURL(blob), 'How哥你都看了些啥.gif');
        });

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

                //const v = [img1, img2, img3].join(',')
                //setQueryStringParameter('imgs', encodeURIComponent(v))
            });
    }

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
        }, 100);
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
        this.video.addEventListener("ended", function () {
            self.gif.render();
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

        if (this.video.currentTime < 1.3 && !this.done1) {
            this.p1.draw(this.screenPositions);
            this.done1 = true
            this.printUrl();
        }
        else if (this.video.currentTime >= 1.3 && this.video.currentTime < 3.2 && !this.done2) {
            this.p2.draw(this.screenPositions);
            this.done2 = true
            this.printUrl();
        }
        else if (this.video.currentTime >= 3.2 && this.video.currentTime < 4.7 && !this.done3) {
            this.p3.draw(this.screenPositions);
            this.done3 = true
            this.printUrl();
        }
        else if (this.video.currentTime >= 4.7 && !this.done4) {
            this.p4.draw(this.screenPositions);
            this.done4 = true
            this.printUrl();
        }
        this.ctx1.drawImage(this.c2, 0, 0, this.width, this.height);

        this.gif.addFrame(this.ctx1, { copy: true, delay: 100 })

        updateProgress((this.video.currentTime / this.video.duration * 100), '播放預覽')

        return;
    },

    printUrl: function () {
        this.ctx2.font = "28px Arial";
        this.ctx2.fillStyle = "white";
        this.ctx2.fillText("https://lab.howgerwatch.aotter.net", 200, 340);
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

            img.src = '/img/' + encodeURIComponent(imageUrl);
            imageArray.push(img);
        }));
    }

    await Promise.all(promiseArray);
    return imageArray;
}

function download(dataurl, filename) {
    var a = document.createElement("a");
    a.href = dataurl;
    a.setAttribute("download", filename);
    a.click();
}

const progress = $('#progress');
function updateProgress(value, text) {
    progress.html(text + ' ' + value.toFixed(0) + '%');
    //$('.progress-bar').css('width', value + '%').attr('aria-valuenow', value).html(text + ' ' + value.toFixed(0) + '%');
}