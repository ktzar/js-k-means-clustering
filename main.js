function log(message) {
    $('#log').val($('#log').val() + message + "\n" );
}

var Clusters = function (k, points, options) {
    if (typeof options === 'undefined') {
        options = {
            //http://en.wikipedia.org/wiki/K-means_clustering#Initialization_methods
            initMode: 'forgy',// forgy or random
        };
    }


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

    function init() {
        initBoundaries();
        initClusters();
        assignPointsToClusters();
    }

    function initBoundaries() {
        var x, y;
        for (var i in that.points) {
            x = that.points[i].x;
            y = that.points[i].y;
            if (x < that.bounds.minX) that.bounds.minX = x;
            if (y < that.bounds.minY) that.bounds.minY = y;
            if (y > that.bounds.maxX) that.bounds.maxX = x;
            if (y > that.bounds.maxY) that.bounds.maxY = y;
        }
    }

    function initClusters() {
        that.clusters = new Array(k);
        var rangeX = that.bounds.maxX - that.bounds.minX,
            rangeY = that.bounds.maxY - that.bounds.minY;
        for (var i = 0; i<k; i++) {
            that.clusters[i] = {
                index: i,
                x: Math.round(that.bounds.minX + Math.random() * that.bounds.maxX),
                y: Math.round(that.bounds.minY + Math.random() * that.bounds.maxY)
            };
            console.log('cluster '+i, that.clusters[i]);
        }
    }

    function getDistance(a, b) {
        return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    }

    function assignPointsToClusters() {
        var point, cluster, c, changes = 0;
        //empty clusters' points
        for (c = 0; c < that.clusters.length; c++) {
            that.clusters[c].points = [];
        }
        for(var p = 0; p < that.points.length ; p++) {
            point = that.points[p];
            originalCluster = point.cluster;

            point.cluster = that.closerCluster(point.x, point.y);

            if (point.cluster != originalCluster) {
                changes ++;
            }
            point.cluster.points.push(point);
        }
        return changes;
    }

    function recenterClusters() {
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
    }


    /* Public methods */

    //Move cluster to the mean of its points
    this.step = function () {
        var hasAClusterNoPoints = false;
        // if there's a cluster with no points, restart
        for (var c = 1; c < that.clusters.length; c++) {
            if ( that.clusters[c].points.length === 0) {
                hasAClusterNoPoints = true;
                break;
            }
        }

        if (hasAClusterNoPoints) {
            initClusters();
        } else {
            recenterClusters();
        }
        return assignPointsToClusters();
    };

    this.closerCluster = function (x, y) {
        var point = {
            x: x,
            y: y,
            cluster: that.clusters[0]
        }, cluster;

        point.cluster = that.clusters[0];
        for (c = 1; c < that.clusters.length; c++) {
            cluster = that.clusters[c];
            if (getDistance(point, point.cluster) > getDistance(point, cluster)) {
                point.cluster = cluster;
            }
        }
        return point.cluster;
    };

    init();

};


$(function () {

    var randomSpread = 100;
    var colours = ['red', 'green', 'blue', 'purple', 'orange', 'yellow', 'brown', 'black'];
    var voronoiDefinition = 2;

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
            stepUntilConvergenceClusters();
        }
    }

    function colourClusters() {
        clusters = false;
        stepUntilConvergenceClusters();
        redrawColours();
    }

    function drawCircle (x, y, color, fill) {
        if (typeof color === 'undefined') color = 'green';
        if (typeof fill !== 'undefined') fill = 'none';
        ctx.strokeStyle = color;
        ctx.fillStyle = fill;
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

    function redrawColours () {
        var i, p;
        ctx.clearRect(0,0,cnv.width(), cnv.height());
        if (clusters) {
            for (i in clusters.clusters) {
                for (p in clusters.clusters[i].points) {
                    point = clusters.clusters[i].points[p];
                    drawCircle(point.x, point.y, colours[i%colours.length]);
                }
            }
        }
    }

    function voronoiDiagram () {
        var x, y;
        var canvasWidth = cnv[0].width;
        var canvasHeight = cnv[0].height;

        function drawDot (x, y, color) {
            ctx.fillStyle = color;
            ctx.fillRect( x, y, voronoiDefinition, voronoiDefinition);
        }

        ctx.globalAlpha = 0.5;
        for ( x=0 ; x<canvasWidth ; x+=voronoiDefinition) {
            for ( y=0 ; y<canvasHeight ; y+=voronoiDefinition) {
                cluster = clusters.closerCluster(x,y);
                drawDot(x, y, colours[cluster.index%colours.length]);
            }
        }
        ctx.globalAlpha = 1;
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
            if (clusters) {
                stepUntilConvergenceClusters();
                voronoiDiagram();
            }
        });

        $('#debug').click(function () { debugger; });
        $('#init').click(initClusters);
        $('#add').click(addRandom);
        $('#step').click(stepClusters);
        $('#step_all').click(stepUntilConvergenceClusters);
        $('#colour').click(colourClusters);
        $('#voronoi').click(voronoiDiagram);

        console.log(cnv, ctx);
    }

    init();

});
