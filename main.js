var Clusters = function (k, points) {
    this.k = k;
    this.points = points;
    this.bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };

    var that = this;

    function initBoundaries() {
        for (var i in that.points) {
            point = that.points[i];
            if (point.x < that.bounds.minX) that.bounds.minX = point.x;
            if (point.y < that.bounds.minY) that.bounds.minY = point.y;
            if (point.y > that.bounds.maxX) that.bounds.maxX = point.x;
            if (point.y > that.bounds.maxY) that.bounds.maxY = point.y;
        }
    }

    function init() {
        initBoundaries();
        that.clusters = new Array(k);

        for (var i = 0; i<k; i++) {
            that.clusters[i] = {
                x: parseInt(that.bounds.minX + Math.random() * that.bounds.maxX, 10),
                y: parseInt(that.bounds.minY + Math.random() * that.bounds.maxY, 10)
            };
        }
    }

    init();


};


$(function () {

    var points = [],
        cnv,
        ctx,
        clusters,
        K = 5;

    function initClusters() {
        if (points.length < K) {
            alert("No points yet, draw "+K+" before");
        } else {
            clusters = new Clusters(K, points);
            redraw();
        }
    }

    function stepClusters() {
        if (clisters) {
            clusters.step();
        }
    }

    function drawCircle (x, y, color) {
        if (typeof color === 'undefined') color = 'green';
        ctx.strokeStyle = color;
        ctx.lineWidth = 5.0;
        ctx.beginPath();
        ctx.arc (x, y, 2.5, 0, 2*Math.PI);
        ctx.stroke();
    }

    function addPoint (x, y) {
        points.push({x:x,y:y});
        redraw();
    }

    function redraw () {
        ctx.clearRect(0,0,cnv.width(), cnv.height());
        var point, i;
        for (i in points) {
            point = points[i];
            drawCircle(point.x, point.y);
        }

        if (clusters) {
            for (i in clusters.clusters) {
                point = clusters.clusters[i];
                drawCircle(point.x, point.y, 'red');
            }
        }
    }

    function init() {

        cnv = $('#plot');
        ctx = cnv[0].getContext('2d');

        cnv.click(function (e) {
            addPoint(e.offsetX, e.offsetY);
        });

        $('#debug').click(function () { debugger; });
        $('#init').click(initClusters);
        $('#step').click(stepClusters);

        console.log(cnv, ctx);
    }

    init();


});
