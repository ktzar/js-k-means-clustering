require(['jquery', './js/modules/Clusters'], function ($, Clusters) {
    function log(message) {
        $('#log').val($('#log').val() + message + "\n" );
    }

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

        $('#debug').click(function () { debugger; });
        $('#init').click(initClusters);
        $('#add').click(addRandom);
        $('#step').click(stepClusters);
        $('#step_all').click(stepUntilConvergenceClusters);
        $('#colour').click(colourClusters);
        $('#voronoi').click(voronoiDiagram);

        console.log(cnv, ctx);
    }

    $(function () {
        init();
    });
});
