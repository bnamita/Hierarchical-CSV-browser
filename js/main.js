d3.csv("./data/nagpur_budget_data.csv", function(csv_data) {

    var levels = ['Section' , 'Function Group', 'Function Description', 'Description'],
        activeHierarchy = {},
        selectedVal = "2016-17 standing committee";


    function getNestedData(n) {
        var sub_levels = levels.slice(0,n);
        var nested_data = d3.nest()

           sub_levels.forEach(function(key) {
               nested_data.key(function (d) {
                   return d[key];
               })
           });

        nested_data = nested_data.rollup(function (leaves) {
                return {
                    "length": leaves.length, "total_spend": d3.sum(leaves, function (d) {
                        return parseFloat(d[selectedVal]);
                    })
                }
            })
            .map(csv_data);

        return nested_data;

    }

    function findInMap(data, name) {
        var subData = undefined;
        for (key in data){
            if (key === name) {
                return data[key];
            }

        }
        for (key in data) {
            subData = findInMap(data[key], name)
            if (subData) {
                return subData;
            }
        }

    }
    function getDataAtLevel(parent, level, data, parentHierarchy) {
        // search for parent root in nested_data and return children
        if (parent !== null) {
            if (parentHierarchy) {
                data = data[parentHierarchy];
            }
            var subData = findInMap(data, parent);

        }
        return subData;

    }


    function displayLevel(parent, level, data) {
        var nested_data = getNestedData(1),
            subData;
        if (parent !== null) {
            var parentHierarchy;
            if (level !== 2) {
                parentHierarchy = (activeHierarchy[1] !== undefined) ? activeHierarchy[1].attr("value") : null;
            }

            data = getDataAtLevel(parent, level, data, parentHierarchy)
        }
        data = (data !== undefined) ? data : nested_data;
        var div = d3.select(".container")
        var selector = levels[level-1].replace(" ","") + '_parent';
        if (d3.select('.' + selector)._groups[0][0] !== null) {
            // already exists, overwrite
            var existing_div = $('.' + selector);
            existing_div.html("");
            div = d3.select('.' + selector);
            // if selector div already exists, remove children of that div
            for (var k = level-1; k < levels.length; k++) {
                var child_div_selector = levels[k].replace(" ","") + '_parent';
                var child_div = $('.' + child_div_selector);
                child_div.html("");
            }
        }
        else {
            div = div.append('div')
                .attr("class", "box " + selector)
        }

       div.selectAll('div')
        .data(d3.entries(data))
        .enter()
        .append("div")
        .attr("class", levels[level-1])
           .attr("value", function(d){
               return d.key;
           })
        .html(function(d, i){
           if (d.value.total_spend !== undefined) {
               if ((level) >= (levels.length) ) {
                   return '<i class="fa fa-file" aria-hidden="true"></i> <span class="key">' + d.key  + '</span>' + ((d.value !== undefined) ? " : <span class='num'>" + d.value.total_spend.toFixed(2) : '</span>');
               } else {
                   return '<i class="fa fa-folder" aria-hidden="true"></i> <span class="key">' + d.key  + '</span>' + ((d.value !== undefined) ? " : <span class='num'>" + d.value.total_spend.toFixed(2) + '</span><i class="fa fa-caret-right" aria-hidden="true"></i>' : "");
               }
           }
        })
        .on("click", function(d, e, f) {
            var className = f[e].className.replace(" active","");
            var click_level =  levels.indexOf(className) + 1;
            subData = getNestedData(click_level+1);
            var parent = (d !== undefined && d !== null && d.key) ? d.key : (d !== undefined && d !== null) ? d : null;
            if (click_level < levels.length) {
               displayLevel(parent, click_level+1,  subData)
               var keys = Object.keys(activeHierarchy);
               if (keys.indexOf(click_level.toString()) >= 0) {
                   for (var j = click_level; j <= levels.length; j++) {
                       if (activeHierarchy[j] !== undefined) {
                           activeHierarchy[j].classed("active", false);
                           delete activeHierarchy[j];
                       }
                   }
               }
               d3.select(this).classed("active", true);
               activeHierarchy[click_level] = d3.select(this);
           }

        });
    }

    displayLevel(null,1);

    $("#value_list").change(function(){
        selectedVal = $(this).val();
        displayLevel(null,1);

    });
});