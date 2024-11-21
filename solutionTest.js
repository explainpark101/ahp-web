function hasCycleWithWeights(inequalities) {
    let graph = {};
    let vertices = new Set();

    // 그래프 구성: 각 부등식에 대해 간선과 가중치를 설정
    for (let [a, b, weight] of inequalities) {
        if (!(a in graph)) graph[a] = [];
        if (!(b in graph)) graph[b] = [];
        
        graph[a].push({ node: b, weight: weight });  // a -> b로 가는 간선, weight는 가중치
        graph[b].push({ node: a, weight: -weight }); // b -> a로 가는 간선, weight는 -가중치
        vertices.add(a);
        vertices.add(b);
    }

    // 벨만-포드 알고리즘을 사용하여 사이클 탐지
    let distances = {};
    for (let vertex of vertices) {
        distances[vertex] = Infinity;
    }
    
    // 임의의 시작점 (여기서는 첫 번째 정점을 사용)
    let start = [...vertices][0];
    distances[start] = 0;

    // 부등식 관계에 대해 relax 과정 수행 (V-1 번 반복)
    for (let i = 1; i < vertices.size; i++) {
        for (let u in graph) {
            for (let edge of graph[u]) {
                let { node, weight } = edge;
                if (distances[u] !== Infinity && distances[u] + weight < distances[node]) {
                    distances[node] = distances[u] + weight;
                }
            }
        }
    }

    // 사이클 탐지 (V번째 반복에서 여전히 값이 변화하면 사이클 존재)
    for (let u in graph) {
        for (let edge of graph[u]) {
            let { node, weight } = edge;
            if (distances[u] !== Infinity && distances[u] + weight < distances[node]) {
                return true;  // 사이클이 존재함
            }
        }
    }

    return false;  // 사이클이 없음
}

// 예시 부등식 (각 부등식은 [A, B, weight] 형태)
let inequalities = [
    ['A', 'B', 5],   // A < B (5)
    ['B', 'C', 3],   // B < C (3)
    ['C', 'A', 7]    // C < A (7)
];

let result = hasCycleWithWeights(inequalities);
console.log(result ? "순환 관계가 있습니다." : "순환 관계가 없습니다.");
