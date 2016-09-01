d3.csv("./data/nagpur_budget_data.csv", function(csv_data) {

    var levels = ['Section' , 'Function Group', 'Function Description', 'Description'],
        activeHierarchy = {},
        selectedVal = "2016-17 standing committee";


    function getNestedData(n) {
        //n = 3;
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
                        return parseFloat(d['2016-17 standing committee']);
                    })
                }
            })
            .entries(csv_data);

        return nested_data;

    }


    function find(theObject, parent) {
        var result = null;
        if(theObject instanceof Array) {
            for(var i = 0; i < theObject.length; i++) {
                result = find(theObject[i], parent);
                if (result) {
                    break;
                }
            }
        }
        else
        {
            for(var prop in theObject) {
                console.log(prop + ': ' + theObject[prop]);
                if(prop == 'key') {
                    if(theObject[prop] == parent) {
                        return theObject;
                    }
                }
                if(theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
                    result = find(theObject[prop], parent);
                    if (result) {
                        break;
                    }
                }
            }
        }
        return result;
    }

    function getDataAtLevel(parent, level, data, parentHierarchy) {
        // search for parent root in nested_data and return children

        if (parent !== null) {
            //parentData = _.findKey(csv_data, level);
            //var dataObj = _.find(data, function(obj) {
            //    return obj.key === parent;
            //
            //});
            //var dataObj = _.findDeep(data, { 'key': ''+ parent + '' })
            if (parentHierarchy) {
                data = _.find(data, function(obj) {
                    return obj.key === parentHierarchy;
                });
            }

            dataObj = find(data, parent);
            subData = (dataObj !== null && dataObj.values !== undefined) ? dataObj.values : dataObj;

        }
        return subData;

    }


    function toggleActiveCSS() {


    }

    function displayLevel(parent, level, data) {
        // if level textarea already present, replace data; else create textarea
        var nested_data = getNestedData(1),
            subData;
        //var first_level_data = getDataAtLevel(null,nested_data);
        //var text;
        if (parent !== null) {
            var parentHierarchy = (activeHierarchy[1] !== undefined) ? activeHierarchy[1].attr("value") : null;
            data = getDataAtLevel(parent, level, data)
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
                .data(data)
                .enter()
                .append("div")
                //.append("span")
                .attr("class", levels[level-1])
                   .attr("value", function(d){
                       return d.key;
                   })
                .html(function(d, i){
                       if ((level) >= (levels.length) ) {
                           return '<i class="fa fa-file" aria-hidden="true"></i> <span class="key">' + d.key  + '</span>' + ((d.value !== undefined) ? " : <span class='num'>" + d.value.total_spend.toFixed(2) : '</span>');
                       } else {
                           return '<i class="fa fa-folder" aria-hidden="true"></i> <span class="key">' + d.key  + '</span>' + ((d.value !== undefined) ? " : <span class='num'>" + d.value.total_spend.toFixed(2) + '</span><i class="fa fa-caret-right" aria-hidden="true"></i>' : "");
                       }

                })
                .on("click", function(d, e, f) {
                       var className = f[e].className.replace(" active","");
                    var click_level =  levels.indexOf(className) + 1;
                    subData = getNestedData(click_level+1);
                    var parent = (d !== undefined && d !== null && d.key) ? d.key : (d !== undefined && d !== null) ? d : null;
                    displayLevel(parent, click_level+1,  subData)
                       //$('.active').removeCSS('active');



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




                });
        }

        //_.forEach(nested_data, function(value, key) {
        //    div.append($('<div class='+ levels[level] + '>' + value.key + " : " + value.value.total_spend + '</div>' + "\n") );
        //
        //});
        //div.add(text);



    displayLevel(null,1);

    $("#value_list").change(function(){
        selectedVal = $(this).val();
        displayLevel(null,1);

    });

    //d3.select(".container").selectAll('textarea').html(keylist.keys());
});