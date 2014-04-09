function log(message) {
    $('#debug').val($('#debug').val() + "\n" + message);
}

var Clusters = function (k, points) {
    this.k = k;
    this.points = points;
    this.bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    this.clusters = false;

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

    function initClusters() {
        that.clusters = new Array(k);
        for (var i = 0; i<k; i++) {
            that.clusters[i] = {
                x: Math.round(that.bounds.minX + Math.random() * that.bounds.maxX),
                y: Math.round(that.bounds.minY + Math.random() * that.bounds.maxY)
            };
            console.log('cluster '+i, that.clusters[i]);
        }
    }

    function getDistance(a, b) {
        return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    }

    function assignPoints() {
        var point, cluster, c, changes = 0;
        //empty clusters' points
        for (c = 0; c < that.clusters.length; c++) {
            that.clusters[c].points = [];
        }
        for(var p = 0; p < that.points.length ; p++) {
            point = that.points[p];
            originalCluster = point.cluster;

            point.cluster = that.clusters[0];
            for (c = 1; c < that.clusters.length; c++) {
                cluster = that.clusters[c];
                if (getDistance(point, point.cluster) > getDistance(point, cluster)) {
                    point.cluster = cluster;
                }
            }
            if (point.cluster != originalCluster) {
                changes ++;
            }
            point.cluster.points.push(point);
        }
        return changes;
    }

    function init() {
        initBoundaries();
        initClusters();
        assignPoints();
    }

    //Move cluster to the mean of its points
    this.step = function () {
        var totalX, totalY;
        for (var c = 1; c < that.clusters.length; c++) {
            cluster = that.clusters[c];
            totalX = totalY = 0;
            for (i = 0; i < cluster.points.length ; i ++) {
                totalX += cluster.points[i].x;
                totalY += cluster.points[i].y;
            }
            cluster.x = Math.round(totalX / cluster.points.length);
            cluster.y = Math.round(totalY / cluster.points.length);
        }
        return assignPoints();
    };

    init();

};


$(function () {

    var randomSpread = 100;

    var points = [],
        cnv,
        ctx,
        clusters,
        K = 5;

    function initClusters() {
        K = parseInt($('#K').val(), 10);
        if (points.length < K) {
            alert("No points yet, draw "+K+" before");
        } else {
            clusters = new Clusters(K, points);
            $('#K').attr('disabled');
            redraw();
        }
    }

    function stepClusters() {
        if (!clusters) {
            initClusters();
        }
        clusters.step();
        redraw();
    }
    
    function stepUntilConvergenceClusters(previousChanges) {
        var changes;
        if (!clusters) {
            initClusters();
        }
        changes = clusters.step();
        redraw();
        //Convergence clause
        if (
            (typeof previousChanges !== undefined && previousChanges < changes) ||
            changes === 0
        ) {
            log('Convergence achieved');
            return;
        } else {
            setTimeout(stepUntilConvergenceClusters, 250);
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

    function drawLine (pointA, pointB) {
        ctx.strokeStyle = 'navy';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo (pointA.x, pointA.y);
        ctx.lineTo (pointB.x, pointB.y);
        ctx.stroke();
    }

    function addPoint (x, y) {
        points.push({x:x,y:y});
        redraw();
    }

    function addRandom () {
        for (var i = 0; i < 20; i ++) {
            addPoint(
                Math.round(Math.random()*cnv.width()),
                Math.round(Math.random()*cnv.height())
            );
        }
    }

    function redraw () {
        ctx.clearRect(0,0,cnv.width(), cnv.height());
        var point, i;
        for (i in points) {
            point = points[i];
            drawCircle(point.x, point.y);
            if (point.cluster) {
                drawLine(point, point.cluster);
            }
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
            if (e.altKey) {
                for (var i = 0; i < 20; i ++) {
                    addPoint(
                        Math.round(e.offsetX + (Math.random()*randomSpread-randomSpread/2)),
                        Math.round(e.offsetY + (Math.random()*randomSpread-randomSpread/2))
                    );
                }
            }
        });

        $('#debug').click(function () { debugger; });
        $('#init').click(initClusters);
        $('#add').click(addRandom);
        $('#step').click(stepClusters);
        $('#step_all').click(stepUntilConvergenceClusters);

        console.log(cnv, ctx);
    }

    init();


});
