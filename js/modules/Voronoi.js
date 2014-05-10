define(['./Clusters'], function (Clusters) {
    var voronoiDefinition = 2;

    function voronoiDiagram (clusters, cnv) {
        console.log('kk');
        var x, y;
        var canvasWidth = cnv.width;
        var canvasHeight = cnv.height;
        var ctx = cnv.getContext('2d');

        function drawDot (x, y, color) {
            ctx.fillStyle = color;
            ctx.fillRect( x, y, voronoiDefinition, voronoiDefinition);
        }

        ctx.globalAlpha = 0.5;
        for ( x=0 ; x<canvasWidth ; x+=voronoiDefinition) {
            for ( y=0 ; y<canvasHeight ; y+=voronoiDefinition) {
                cluster = clusters.closerCluster(x,y);
                drawDot(x, y, Clusters.colours[cluster.index%Clusters.colours.length]);
            }
        }
        ctx.globalAlpha = 1;
    };
    return {
        draw: voronoiDiagram
    }
});
