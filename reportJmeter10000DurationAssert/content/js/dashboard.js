/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 84.2704562678579, "KoPercent": 15.729543732142101};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8274438549997412, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7452029677639433, 500, 1500, "Get characters"], "isController": false}, {"data": [0.915824130243169, 500, 1500, "PUT  character/id"], "isController": false}, {"data": [0.9361073396693554, 500, 1500, "DELETE character"], "isController": false}, {"data": [0.757967976836146, 500, 1500, "Get character  by id"], "isController": false}, {"data": [0.8177454140673918, 500, 1500, "Post character"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 212441, 33416, 15.729543732142101, 9278.451461817598, 0, 190415, 283.0, 65720.0, 66338.30000000002, 133102.0, 822.6494733581164, 9536.728158641186, 135.01541912924992], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get characters", 46904, 11269, 24.02566945249872, 23068.04701091593, 1, 190415, 413.0, 133642.9, 134195.95, 135327.96000000002, 181.62949194547707, 9266.35928242623, 22.02422982254879], "isController": false}, {"data": ["PUT  character/id", 38574, 2641, 6.8465805983304815, 1871.132654119354, 0, 136234, 254.0, 590.9000000000015, 19152.650000000456, 65770.90000000002, 150.1705155955588, 52.904403203931594, 31.343273527161813], "isController": false}, {"data": ["DELETE character", 37563, 1788, 4.760003194633017, 1399.2477171684934, 1, 136241, 243.0, 511.0, 820.0, 65755.90000000002, 149.376652814507, 46.2182858449486, 25.628881162636947], "isController": false}, {"data": ["Get character  by id", 46279, 10524, 22.74033578945094, 11293.302621059202, 0, 142089, 409.0, 66100.9, 130430.8, 133841.96000000002, 179.82064174198212, 102.40079437596653, 23.755396399332454], "isController": false}, {"data": ["Post character", 43121, 7194, 16.683286565710443, 5606.550520628006, 0, 136259, 341.0, 33214.0, 65252.0, 130613.0, 171.16058634636988, 72.45678755611611, 34.01403473344104], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 212441, 33416, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 11372, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 11112, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 336, "Non HTTP response code: java.net.SocketException/Non HTTP response message: An established connection was aborted by the software in your host machine", 69, "The operation lasted too long: It took 65,520 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 12], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get characters", 46904, 11269, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 8005, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1921, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 117, "The operation lasted too long: It took 60,150 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 3, "The operation lasted too long: It took 60,155 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 3], "isController": false}, {"data": ["PUT  character/id", 38574, 2641, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1370, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 191, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 43, "The operation lasted too long: It took 32,864 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 4, "The operation lasted too long: It took 65,470 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 4], "isController": false}, {"data": ["DELETE character", 37563, 1788, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 951, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 145, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 5, "The operation lasted too long: It took 65,491 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 4, "The operation lasted too long: It took 65,279 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 3], "isController": false}, {"data": ["Get character  by id", 46279, 10524, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4273, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 2453, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 111, "Non HTTP response code: java.net.SocketException/Non HTTP response message: An established connection was aborted by the software in your host machine", 68, "The operation lasted too long: It took 65,520 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 9], "isController": false}, {"data": ["Post character", 43121, 7194, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2597, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 578, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 60, "The operation lasted too long: It took 32,950 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 7, "The operation lasted too long: It took 32,781 milliseconds, but should not have lasted longer than 1,200 milliseconds.", 7], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});