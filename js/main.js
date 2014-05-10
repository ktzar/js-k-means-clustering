define([
    'jquery',
    './modules/Clusters',
    './modules/Voronoi'
], function ($, Clusters, Voronoi) {
    var randomSpread = 100;

    var points = [],
        cnv,
        ctx,
        clusters,
        K = 5;
        cache = {
            log: $('#log'),
            debug: $('#debug'),
            init: $('#init'),
            add: $('#add'),
            step: $('#step'),
            step_all: $('#step_all'),
            colour: $('#colour'),
            voronoi: $('#voronoi')
        };

    function log(message) {
        cache.log.val(cache.log.val() + message + "\n" );
    }


    function initClusters() {
        K = parseInt($('#K').val(), 10);
        if (points.length < K) {
            alert("No points yet, draw "+K+" before");
        } else {
            clusters = new Clusters.init(K, points);
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
                    drawCircle(point.x, point.y, Clusters.colours[i%Clusters.colours.length]);
                }
            }
        }
    }

    function voronoiDiagram() {
        Voronoi.draw(clusters, cnv[0]);
    };

    function init() {
        cnv = $('#plot');
        ctx = cnv[0].getContext('2d');

        cnv.click(function (e) {
            addPoint(e.offsetX, e.offsetY);
            if (e.shiftKey) {
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

        cache.debug.click(function () { debugger; });
        cache.init.click(initClusters);
        cache.add.click(addRandom);
        cache.step.click(stepClusters);
        cache.step_all.click(stepUntilConvergenceClusters);
        cache.colour.click(colourClusters);
        cache.voronoi.click(voronoiDiagram);
    }

    return {
        init: init
    };
});
