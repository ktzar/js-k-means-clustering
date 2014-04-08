var Clusters = function (k, points) {
    this.k = k;
    this.points = points;
    this.bounds = getBoundaries(points);

    function getBoundaries(points) {
        var bounds = {
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
        }, point;

        for (var i in points) {
            point = points[i];
            if (point.x < bounds.minX) bounds.minX = point.x;
            if (point.y < bounds.minY) bounds.minY = point.y;
            if (point.y > bounds.maxX) bounds.maxX = point.x;
            if (point.y > bounds.maxY) bounds.maxY = point.y;
        }

        return bounds;
    }

    this.clusters = new Array(k);

    for (var i = 0; i<k; i++) {
        this.clusters[i] = {
            x: parseInt(this.bounds.minX + Math.random() * this.bounds.maxX, 10),
            y: parseInt(this.bounds.minY + Math.random() * this.bounds.maxY, 10)
        };
    }
};


$(function () {

    var points = [],
        cnv,
        ctx,
        clusters;

    function initClusters() {
        console.log('init');
        clusters = new Clusters(5, points);
    }

    function stepClusters() {
        console.log('step');
    }

    function drawCircle (x, y, color) {
        if (typeof color === 'undefined') color = 'green';
        ctx.strokeStyle = color;
        ctx.lineWidth = 5.0;
        ctx.beginPath();
        ctx.arc (x, y, 2.5, 0, 2*Math.PI);
        ctx.stroke();
    }

    function redraw () {
        ctx.clearRect(0,0,cnv.width(), cnv.height());
        var point;
        for (var i in points) {
            point = points[i];
            drawCircle(point.x, point.y);
        }
    }

    function init() {

        cnv = $('#plot');
        ctx = cnv[0].getContext('2d');

        cnv.click(function (e) {
            points.push({x:e.offsetX,y:e.offsetY});
            redraw();
            console.log(e.offsetX, e.offsetY);
        });

        $('#debug').click(function () { debugger; });
        $('#init').click(initClusters);
        $('#step').click(stepClusters);

        console.log(cnv, ctx);
    }

    init();


});
