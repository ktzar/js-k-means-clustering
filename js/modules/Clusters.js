define([], function () {
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
                    x: Math.round(that.bounds.minX + Math.random() * (that.bounds.maxX - that.bounds.minX)),
                    y: Math.round(that.bounds.minY + Math.random() * (that.bounds.maxY - that.bounds.minY))
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
            for (var c = 0; c < that.clusters.length; c++) {
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
    return Clusters;
});
