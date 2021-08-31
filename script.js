onload = function () {
    let curr_data,V,src,dst;

    const container = document.getElementById('left-pane');
    const container2 = document.getElementById('right-pane-solution-window');
    const genNew = document.getElementById('generate-graph-button');
    const solve = document.getElementById('solve-button');
    const guidelinesText = document.getElementById('guideline-text');
    const heading = document.getElementById('heading');
    //giving total 10 entries
    const cities = ['Delhi', 'Mumbai', 'Gujarat', 'Goa', 'Kanpur', 'Jammu', 'Hyderabad', 'Bangalore', 'Gangtok', 'Meghalaya'];

    //Initialise graph options using features of vis.js library
    const options = {
        edges: {
            labelHighlightBold: true,
            font: {
                size: 14,
            }
        },
        nodes: {
            font: '14px arial purple',
            scaling: {
                label: true
            },
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf3c5',
                size: 30,
                color: 'red',
            }
        }
    };

    // Initializing the vis.js network!
    const network = new vis.Network(container);     // Network for question (left) graph
    network.setOptions(options);
    const network2 = new vis.Network(container2);   // Network for result(right) graph
    network2.setOptions(options);



    //BUTTON 1: Generate new problem button : create new data and display it
    genNew.onclick = function () {
        createData();                               
        network.setData(curr_data);
        var city1 = cities[src-1];
        var city2= cities[dst-1];
        heading.innerText = 'Find the least travel-time path from "'+city1+'" to "'+city2+'"';
        guidelinesText.style.display = "inline";
        heading.style.display = "inline";
        container2.style.display = "none";
        solve.style.display="inline";
    };

    //BUTTON 2: Generate solution button : creates and displays solution graph from given data
    solve.onclick = function () {
        heading.style.display  = "none";
        container2.style.display = "inline";
        network2.setData(solveData()); 
        solve.style.display="none";
    };



    /***FUNCTION 1: Generates question (random flight and bus routes) ***/

    function createData(){
        V = Math.floor(Math.random() * 8) + 3; // Ensures V is between 3 and 10(min 3 nodes graph is a valid graph) 
                                               // Math.random func return any number in [0,1)]
        let nodes = [];
        for(let i=1;i<=V;i++){
            nodes.push({id:i, label: cities[i-1]})
        }
        // Prepares vis.js style nodes for our data
        nodes = new vis.DataSet(nodes);

        // Creating a tree like underlying graph structure
        let edges = [];
        for(let i=2;i<=V;i++){
            let neigh = i - Math.floor(Math.random()*Math.min(i-1,3)+1); // Picks a neighbour from i-3 to i-1
            edges.push({type: 0, from: i, to: neigh, color: 'orange', label: String(Math.floor(Math.random()*70)+31)});
        }

        // Randomly adding new edges to graph
        // Type of bus is 0
        // Type of flight is 1
        for(let i=1;i<=V/2;){

            let n1 = Math.floor(Math.random()*V)+1;
            let n2 = Math.floor(Math.random()*V)+1;
            if(n1!==n2){
                if(n1<n2){              //bus links should be greater than flight links
                    let tmp = n1;
                    n1 = n2;
                    n2 = tmp;
                }
                // Seeing if an edge between these two vertices already exists
                // And if it does then of which kind
                let works = 0;
                for(let j=0;j<edges.length;j++){
                    if(edges[j]['from']===n1 && edges[j]['to']===n2) {
                        if(edges[j]['type']===0)
                            works = 1;
                        else
                            works = 2;
                    }
                }

                // Adding edges to the graph
                // If works == 0, you can add bus as well as plane between vertices
                // If works == 1, you can only add plane between them as bus link already there btw them
                if(works <= 1) {
                    if (works === 0 && i < V / 4) {
                        // Adding a bus
                        edges.push({
                            type: 0,
                            from: n1,
                            to: n2,
                            color: 'orange',
                            label: String(Math.floor(Math.random() * 70) + 31)
                        });
                    } else {
                        // Adding a plane
                        edges.push({
                            type: 1,
                            from: n1,
                            to: n2,
                            color: 'green',
                            label: String(Math.floor(Math.random() * 50) + 1)
                        });
                    }
                    i++;
                }
            }
        }

        // Setting the new values of global variables
        src = 1;
        dst = V;
        curr_data = {
            nodes: nodes,
            edges: edges
        };
    }



    /***FUNCTION 2: DIJISKTRA'S ALGORITHM ***/

    function djikstra(graph, sz, src) {   //graph,V,src
        let vis = Array(sz).fill(0);     //visites array initialized to 0
        let dist = [];
        for(let i=1;i<=sz;i++)
            dist.push([10000,-1]);   //10000 is as infinity here...we initialize distances to inf
                                     //second var -1 is to keep track of parent node from which this shortest dist came
        dist[src][0] = 0;

        for(let i=0;i<sz-1;i++){
            let mn = -1;
            for(let j=0;j<sz;j++){
                if(vis[j]===0){
                    if(mn===-1 || dist[j][0]<dist[mn][0])
                        mn = j;
                }
            }

            vis[mn] = 1;
            for(let j in graph[mn]){
                let edge = graph[mn][j];
                if(vis[edge[0]]===0 && dist[edge[0]][0]>dist[mn][0]+edge[1]){
                    dist[edge[0]][0] = dist[mn][0]+edge[1];
                    dist[edge[0]][1] = mn;
                }
            }
        }

        return dist;
    }

    /***FUNCTION 3: Creates the graph from the data ***/

    function createGraph(data){      //data here is actually curr_data which has nodes and edges
        let graph = [];              //graph array
        for(let i=1;i<=V;i++){
            graph.push([]);          //array containing arrays
        }

        for(let i=0;i<data['edges'].length;i++) {
            let edge = data['edges'][i];
            if(edge['type']===1)        //1 was for flight edge
                continue;
            graph[edge['to']-1].push([edge['from']-1,parseInt(edge['label'])]);
            graph[edge['from']-1].push([edge['to']-1,parseInt(edge['label'])]);
        }
        return graph;
    }
        
    /***FUNCTION 4: Checks if Plane should be taken ***/
    //CONDITION  : we can take only one flight in whole travel

    function shouldTakePlane(edges, dist1, dist2, mn_dist) {
        let plane = 0;   //var which stores 0 if we shouldnt take a plane , but stores wt of plane path if we shpuld take a plane

        let p1=-1, p2=-1;
        for(let pos in edges){
            let edge = edges[pos];
            if(edge['type']===1){
                let to = edge['to']-1;
                let from = edge['from']-1;
                let wght = parseInt(edge['label']);
                if(dist1[to][0]+wght+dist2[from][0] < mn_dist){
                    plane = wght;
                    p1 = to;
                    p2 = from;
                    mn_dist = dist1[to][0]+wght+dist2[from][0];
                }
                if(dist2[to][0]+wght+dist1[from][0] < mn_dist){
                    plane = wght;
                    p2 = to;
                    p1 = from;
                    mn_dist = dist2[to][0]+wght+dist1[from][0];
                }
            }
        }
        return {plane, p1, p2};
    }

    /***FUNCTION 5: Finds the solution path ***/
    
    function solveData() {

        const data = curr_data;

        // Creating adjacency list matrix graph from question data
        const graph = createGraph(data);

        // Applying djikstra from src and dst
        let dist1 = djikstra(graph,V,src-1);
        let dist2 = djikstra(graph,V,dst-1);

        // Initialise min_dist to min distance via bus from src to dst
        let mn_dist = dist1[dst-1][0];

        // See if plane should be used
        let {plane, p1, p2} = shouldTakePlane(data['edges'], dist1, dist2, mn_dist);

        let new_edges = [];
        if(plane!==0){
            new_edges.push({arrows: { to: { enabled: true}}, from: p1+1, to: p2+1, color: 'green',label: String(plane)});
            // Using spread operator to push elements of result of pushEdges to new_edges
            new_edges.push(...pushEdges(dist1, p1, false));
            new_edges.push(...pushEdges(dist2, p2, true));
        } else{
            new_edges.push(...pushEdges(dist1, dst-1, false));
        }
        const ans_data = {
            nodes: data['nodes'],
            edges: new_edges
        };
        return ans_data;
    }

    /***FUNCTION 6: To add edges  ***/

    function pushEdges(dist, curr, reverse) {
        let tmp_edges = [];
        while(dist[curr][0]!==0){
            let fm = dist[curr][1];
            if(reverse)
                tmp_edges.push({arrows: { to: { enabled: true}},from: curr+1, to: fm+1, color: 'orange', label: String(dist[curr][0] - dist[fm][0])});
            else
                tmp_edges.push({arrows: { to: { enabled: true}},from: fm+1, to: curr+1, color: 'orange', label: String(dist[curr][0] - dist[fm][0])});
            curr = fm;
        }
        return tmp_edges;
    }

    genNew.click();
};