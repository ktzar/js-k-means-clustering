define([
    'jquery',
    './modules/Clusters',
    './modules/Voronoi',
    './modules/Drawing'
], function ($, Clusters, Voronoi, drawing) {
    var randomSpread = 100;

    var points = [],
        cnv,
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
        drawing.clear();
        var point, i;
        for (i in points) {
            point = points[i];
            drawing.drawCircle(point.x, point.y);
            if (point.cluster) {
                drawing.drawLine(point, point.cluster);
            }
        }

        if (clusters) {
            for (i in clusters.clusters) {
                point = clusters.clusters[i];
                drawing.drawCircle(point.x, point.y, 'red');
            }
        }
    }

    function redrawColours () {
        var i, p;
        drawing.clear();
        if (clusters) {
            for (i in clusters.clusters) {
                for (p in clusters.clusters[i].points) {
                    point = clusters.clusters[i].points[p];
                    drawing.drawCircle(point.x, point.y, Clusters.colours[i%Clusters.colours.length]);
                }
            }
        }
    }

    function voronoiDiagram() {
        Voronoi.draw(clusters, cnv[0]);
    };

    function init() {
        cnv = $('#plot');
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

        drawing.init(cnv);

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
