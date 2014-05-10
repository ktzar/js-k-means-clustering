define(['jquery'] , function ($) {
    var ctx, cnv;

    return {
        drawCircle: function (x, y, color, fill) {
            if (typeof color === 'undefined') color = 'green';
            if (typeof fill !== 'undefined') fill = 'none';
            ctx.strokeStyle = color;
            ctx.fillStyle = fill;
            ctx.lineWidth = 5.0;
            ctx.beginPath();
            ctx.arc (x, y, 2.5, 0, 2*Math.PI);
            ctx.stroke();
        },
        drawLine: function(pointA, pointB) {
            ctx.strokeStyle = 'navy';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo (pointA.x, pointA.y);
            ctx.lineTo (pointB.x, pointB.y);
            ctx.stroke();
        },
        clear: function () {
            ctx.clearRect(0,0,cnv.width(), cnv.height());
        },
        init: function (canvas) {
            cnv = canvas;
            ctx = cnv[0].getContext('2d');
        }
    };
});
