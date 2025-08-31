class Item {
    /** @type { String } */ name = 'Item 1';
    /** @type { Number } */ number = 1;
    /** @type { HTMLElement } */ #nameInputContainer;
    get no() { return this.number }
    constructor(data) {
        Object.assign(this, data);
    }

    get nameInput () {
        if (this.#nameInputContainer) return this.#nameInputContainer;
        this.#nameInputContainer = document.createElement("div");
        this.#nameInputContainer.innerHTML = `
            <label for="item-name-${this.no}">Item ${this.no} Name</label>
            <input type="text" id="item-name-${this.no}" name="item-name-${this.no}" form="step-1-form" />
        `;
        const input = this.#nameInputContainer.querySelector(`input`);
        input.value = this.name;
        input.addEventListener("input", e=>{
            this.name = e.target.value;
        });
        return this.#nameInputContainer;
    }

}
class Criteria {
    /** @type { String } */ name = 'Criteria 1';
    /** @type { Number } */ number = 1;
    /** @type { Item[] } */ items = [];
    /** @type { HTMLElement } */ #nameInputContainer;
    get no() { return this.number }
    constructor(data) {
        Object.assign(this, data);
        this.name = `Criteria ${this.no}`;
    }
    get nameInput () {
        if (this.#nameInputContainer) return this.#nameInputContainer;
        this.#nameInputContainer = document.createElement("div");
        this.#nameInputContainer.innerHTML = `
            <label for="criteria-name-${this.no}">Criteria ${this.no} Name</label>
            <input type="text" id="criteria-name-${this.no}" name="criteria-name-${this.no}" form="step-1-form" />
        `;
        const input = this.#nameInputContainer.querySelector(`input`);
        input.value = this.name;
        input.addEventListener("input", e=>{
            this.name = e.target.value;
        });
        return this.#nameInputContainer;
    }
}

const itemCountInput = document.querySelector(`input#item-count`),
    criteriaCountInput = document.querySelector(`input#criteria-count`);
let /** @type { Item[] } */ items = new Array(),
    /** @type { Criteria[] } */ criterias = new Array();
const step2Article = document.querySelector(`article#step-2`);
document.querySelector(`form#step-0-setting-form`).addEventListener("submit", e=>{
    e.preventDefault();
    items = Array.from(Array(+itemCountInput.value).keys()).map(idx=>new Item({number: idx+1, name: `Item ${idx+1}`}));
    criterias = Array.from(Array(+criteriaCountInput.value).keys()).map(idx=>new Criteria({number: idx+1, items}));
    document.querySelector(`#item-names .inputs`).innerHTML = '';
    items.forEach(item=>document.querySelector(`#item-names .inputs`).appendChild(item.nameInput));
    document.querySelector(`#criteria-names .inputs`).innerHTML = '';
    criterias.forEach(criteria=>document.querySelector(`#criteria-names .inputs`).appendChild(criteria.nameInput));
    document.querySelector(`form#step-1-form`).classList.remove("d-none");
});
document.querySelector(`form#step-1-form`).addEventListener("submit", e=>{
    e.preventDefault();
    const contentContainer = step2Article.querySelector(`.contents`);
    contentContainer.innerHTML = '';
    criterias.map(criteria=>{
        let container = document.createElement("div");
        container.classList.add("data-matrix");
        container.id = `criteria-${criteria.no}`;
        container.innerHTML = `
            <h5>${criteria.name}</h5>
            <small></small>
            <table>
                <thead>
                    <tr>
                        <th></th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;
        criteria.items.forEach(item=>{
            container.querySelector(`thead tr`).insertAdjacentHTML(`beforeend`, `<th>${item.name}</th>`);
            let tableRowHTML = criteria.items.map((el) =>{
                if (el.no == item.no) return `
                    <td>
                        <select form="step-2-form" name="criteria-${criteria.number}__item-${el.no}__item-${item.no}" class="score-select" disabled>
                            <option value="1" selected>1 - 동등한 중요도</option>
                        </select>
                    </td>
                `
                return `
                    <td>
                        <select form="step-2-form" name="criteria-${criteria.number}__item-${el.no}__item-${item.no}" class="score-select">
                            <option value="">선택하세요</option>
                            <option value="9">9 - 극도로 더 중요</option>
                            <option value="7">7 - 매우 더 중요</option>
                            <option value="5">5 - 훨씬 더 중요</option>
                            <option value="3">3 - 약간 더 중요</option>
                            <option value="1">1 - 동등한 중요도</option>
                            <option value="0.3333">1/3 - 약간 덜 중요</option>
                            <option value="0.2">1/5 - 훨씬 덜 중요</option>
                            <option value="0.1429">1/7 - 매우 덜 중요</option>
                            <option value="0.1111">1/9 - 극도로 덜 중요</option>
                        </select>
                    </td>
                `
            }).join("\n");
            container.querySelector(`tbody`).insertAdjacentHTML(`beforeend`, `
                <tr>
                    <th>${item.name}</th>
                    ${tableRowHTML}
                </tr>
            `);
            container.addEventListener("change", e=>{
                /** @type { HTMLSelectElement } */
                const select = e.target;
                const inputName = e.target.name;
                if (!inputName || !select.value) return;
                const [criteriaNo, item1No, item2No] = inputName.split("__");
                // 대소비교 하는 거 추가해줘야함.
                const oppositeSelect = container.querySelector(`select[name="${criteriaNo}__${item2No}__${item1No}"]`);
                if (oppositeSelect) {
                    const oppositeValue = {
                        9: 0.1111,
                        7: 0.1429,
                        5: 0.2,
                        3: 0.3333,
                        1: 1,
                        0.3333: 3,
                        0.2: 5,
                        0.1429: 7,
                        0.1111: 9,
                    }[+e.target.value];

                    oppositeSelect.value = oppositeValue;
                }
            });
            container.addEventListener("change", e=>{
                if (!Array.from(container.querySelectorAll("select")).find(el=>!el.value)) {
                    const [tmp, { CR }] = calculateMatrix("", (matContainer => {
                        let values = Array.from(matContainer.querySelectorAll("tbody tr")).map(tr=>{
                            return Array.from(tr.querySelectorAll("select")).map(el=>+el.value)
                        });
                        return values;
                    })(container));
                    let crStatus = '';
                    if (CR <= 0.1) {
                        crStatus = '<b class="status-trustworthy">신뢰할 수 있음</b>';
                    } else if (CR >= 0.9) {
                        crStatus = '<b class="status-untrustworthy">신뢰할 수 없음</b>';
                    } else {
                        crStatus = '<b class="status-acceptable">허용 가능</b>';
                    }
                    container.querySelector("small").innerHTML = `CR: ${CR.toFixed(4)} ${crStatus}`;
                }
            });

        });
        return container;
    }).forEach(el=>contentContainer.appendChild(el));
    (()=>{
        let container = document.createElement("div");
        container.classList.add("data-matrix");
        container.id = `criteria-matrix`;
        container.innerHTML = `
            <h5>Criteria Matrix</h5>
            <small></small>
            <table>
                <thead>
                    <tr>
                        <th></th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;
        criterias.map(criteria1=>{
            container.querySelector(`thead tr`).insertAdjacentHTML(`beforeend`, `<th>${criteria1.name}</th>`);
            let tableRowHTML = criterias.map((el) =>{
                if (el.no == criteria1.no) return `
                    <td>
                        <select form="step-2-form" name="criteria-${el.no}__criteria-${criteria1.no}" class="score-select" disabled>
                            <option value="1" selected>1 - 동등한 중요도</option>
                        </select>
                    </td>
                `
                return `
                    <td>
                        <select form="step-2-form" name="criteria-${el.no}__criteria-${criteria1.no}" class="score-select">
                            <option value="">선택하세요</option>
                            <option value="9">9 - 극도로 더 중요</option>
                            <option value="7">7 - 매우 더 중요</option>
                            <option value="5">5 - 훨씬 더 중요</option>
                            <option value="3">3 - 약간 더 중요</option>
                            <option value="1">1 - 동등한 중요도</option>
                            <option value="0.3333">1/3 - 약간 덜 중요</option>
                            <option value="0.2">1/5 - 훨씬 덜 중요</option>
                            <option value="0.1429">1/7 - 매우 덜 중요</option>
                            <option value="0.1111">1/9 - 극도로 덜 중요</option>
                        </select>
                    </td>
                `
            }).join("\n");
            container.querySelector(`tbody`).insertAdjacentHTML(`beforeend`, `
                <tr>
                    <th>${criteria1.name}</th>
                    ${tableRowHTML}
                </tr>
            `);
            container.addEventListener("change", e=>{
                const inputName = e.target.name;
                if (!inputName || !e.target.value) return;
                const [criteria1No, criteria2No] = inputName.split("__");
                const oppositeSelect = container.querySelector(`select[name="${criteria2No}__${criteria1No}"]`);
                if (oppositeSelect) {
                    const oppositeValue = {
                        9: 0.1111,
                        7: 0.1429,
                        5: 0.2,
                        3: 0.3333,
                        1: 1,
                        0.3333: 3,
                        0.2: 5,
                        0.1429: 7,
                        0.1111: 9,
                    }[+e.target.value];

                    oppositeSelect.value = oppositeValue;
                }
            });
            container.addEventListener("change", e=>{
                if (!Array.from(container.querySelectorAll("select")).find(el=>!el.value)) {
                    const [tmp, { CR }] = calculateMatrix("", (matContainer => {
                        let values = Array.from(matContainer.querySelectorAll("tbody tr")).map(tr=>{
                            return Array.from(tr.querySelectorAll("select")).map(el=>+el.value)
                        });
                        return values;
                    })(container));
                    let crStatus = '';
                    if (CR <= 0.1) {
                        crStatus = '<b class="status-acceptable">신뢰할 수 있음</b>';
                    } else if (CR >= 0.9) {
                        crStatus = '<b class="status-untrustworthy">신뢰할 수 없음</b>';
                    } else {
                        crStatus = '<b class="status-acceptable">허용 가능</b>';
                    }
                    container.querySelector("small").innerHTML = `CR: ${CR.toFixed(4)} ${crStatus}`;
                    }
                });
            return container
        }).forEach(el=>contentContainer.appendChild(el));
    })();
    document.querySelector(`form#step-2-form`).classList.remove("d-none");
});

const calculateMatrix = (key, mat) => {
    let colIndexes = Array.from(Array(mat[0].length).keys());
    let colTotals = colIndexes.map(i=>mat.map(r=>r[i])).map(row=>sumRow(row));
    let newMatrix = mat.map(row=>row.map((el, idx)=>(el/colTotals[idx])));
    let rowAverage = newMatrix.map(el=>sumRow(el)/el.length);
    let ax = matMul(mat, rowAverage.map(el=>[el])).map(el=>el[0]);
    let lambdaMax = (sumRow(zip(ax, rowAverage).map(([a, b])=>(a/b))) / ax.length);
    const CI = (lambdaMax - ax.length) / (  ax.length - 1);
    const RI = {
        1: 0,
        2: 0,
        3: .58,
        4: .90,
        5: 1.12,
        6: 1.24,
        7: 1.32,
        8: 1.41,
        9: 1.45,
        10: 1.49,
        11: 1.51,
        12: 1.48,
        13: 1.56,
        14: 1.57,
        15: 1.59,
    }[ax.length];
    const CR = CI / RI;

    return [key, {
        CI, RI, CR, newMatrix, rowAverage, ax, lambdaMax
    }];
}

let calcData;
document.querySelector(`form#step-2-form`).addEventListener("submit", e=>{
    e.preventDefault();

    // 모든 select 요소가 값을 가지고 있는지 확인
    const allSelects = document.querySelectorAll('.score-select');
    const emptySelects = Array.from(allSelects).filter(select => !select.value);

    if (emptySelects.length > 0) {
        alert('모든 비교 항목에 점수를 입력해주세요.');
        emptySelects[0].focus();
        return;
    }

    const matrixArray = Array.from(document.querySelectorAll(`.data-matrix`));
    calcData = Object.fromEntries(
        matrixArray.map(matContainer => {
            let id = matContainer.id;
            let values = Array.from(matContainer.querySelectorAll("tbody tr")).map(tr=>{
                return Array.from(tr.querySelectorAll("select")).map(el=>+el.value)
            });
            return [id, values];
        })
    );
    // calculation result showing

    let calcResult = Object.fromEntries(
        Object.entries(calcData).map(([key, mat])=>{
            return calculateMatrix(key, mat);
        })
    );
    console.log(calcResult);

    const resultContainer = document.querySelector(`#step-results`);
    resultContainer.innerHTML = '';

    // CI/CR 표지 업데이트
    updateCICRSummary(calcResult);

    // 결과 요약 업데이트
    updateResultsSummary(calcResult);

    Object.entries(calcResult).forEach(([key, data], matrixIndex)=>{
        let article = document.createElement("article");
        let title = matrixIndex >= criterias.length ? "Criterias" : criterias[matrixIndex];
        article.innerHTML = `
            <h4>${title.name ?? "Criterias"}</h4>
            <table class="row-average">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Row Average</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <ul class="ci-cr-data">
                <li class="list-ci">CI: ${data.CI.toFixed(4)}</li>
                <li class="list-cr">CR: ${data.CR.toFixed(4)} </li>
            </ul>
        `;

        // CR 상태에 따른 스타일 적용
        let crStatus = '';
        if (data.CR <= 0.1) {
            crStatus = '<b class="status-trustworthy">신뢰할 수 있음</b>';
        } else if (data.CR >= 0.9) {
            crStatus = '<b class="status-untrustworthy">신뢰할 수 없음</b>';
        } else {
            crStatus = '<b class="status-acceptable">허용 가능</b>';
        }
        article.querySelector(`.list-cr`).insertAdjacentHTML("beforeEnd", crStatus);

        let tblRowElements = data.rowAverage
        .map((el, idx)=>[el, idx]);
        tblRowElements = tblRowElements.sort(([a, adx], [b, bdx])=>b-a);
        tblRowElements = tblRowElements.map(([el, idx])=>{
            let tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${key == "criteria-matrix" ? (criterias[idx]?.name??'Criteria '+idx+1) : (items[idx]?.name??'Item '+idx+1)}</td>
                <td>${el.toFixed(4)}</td>
            `;
            return tr;
        });
        article.querySelector(`table.row-average tbody`).append(...tblRowElements);
        resultContainer.appendChild(article);
    })
});

function zip(arr1, arr2) {
    const length = Math.min(arr1.length, arr2.length);
    return Array.from({ length }, (_, i) => [arr1[i], arr2[i]]);
}

/**
 * CI/CR 표지 요약을 업데이트하는 함수
 * @param {Object} calcResult - 계산 결과 데이터
 */
function updateCICRSummary(calcResult) {
    const summaryContainer = document.querySelector('#ci-cr-summary');
    if (!summaryContainer) return;

    // 모든 매트릭스의 CI/CR 값 수집
    let allCI = [];
    let allCR = [];

    Object.values(calcResult).forEach(data => {
        allCI.push(data.CI);
        allCR.push(data.CR);
    });

    // 평균 CI/CR 계산
    const avgCI = allCI.reduce((sum, ci) => sum + ci, 0) / allCI.length;
    const avgCR = allCR.reduce((sum, cr) => sum + cr, 0) / allCR.length;

    // CI 상태 결정
    let ciStatus = '';
    let ciStatusClass = '';
    if (avgCI <= 0.1) {
        ciStatus = '낮음 (좋음)';
        ciStatusClass = 'trustworthy';
    } else if (avgCI <= 0.2) {
        ciStatus = '보통';
        ciStatusClass = 'acceptable';
    } else {
        ciStatus = '높음 (주의)';
        ciStatusClass = 'untrustworthy';
    }

    // CR 상태 결정
    let crStatus = '';
    let crStatusClass = '';
    if (avgCR <= 0.1) {
        crStatus = '신뢰할 수 있음';
        crStatusClass = 'trustworthy';
    } else if (avgCR < 0.9) {
        crStatus = '허용 가능';
        crStatusClass = 'acceptable';
    } else {
        crStatus = '신뢰할 수 없음';
        crStatusClass = 'untrustworthy';
    }

    // 표지 업데이트
    const ciValueElement = document.querySelector('#ci-value');
    const ciStatusElement = document.querySelector('#ci-status');
    const crValueElement = document.querySelector('#cr-value');
    const crStatusElement = document.querySelector('#cr-status');

    if (ciValueElement) ciValueElement.textContent = avgCI.toFixed(4);
    if (ciStatusElement) {
        ciStatusElement.textContent = ciStatus;
        ciStatusElement.className = `indicator-status ${ciStatusClass}`;
    }

    if (crValueElement) crValueElement.textContent = avgCR.toFixed(4);
    if (crStatusElement) {
        crStatusElement.textContent = crStatus;
        crStatusElement.className = `indicator-status ${crStatusClass}`;
    }

    // 표지 표시
    summaryContainer.classList.remove('d-none');
}

function updateResultsSummary(calcResult) {
    const summaryContainer = document.querySelector('#results-summary');
    if (!summaryContainer) return;

    // criteria-matrix에서 가장 높은 우선순위를 가진 기준 찾기
    const criteriaMatrix = calcResult['criteria-matrix'];
    if (!criteriaMatrix || !criteriaMatrix.rowAverage) return;

    let bestCriteriaIndex = 0;
    let bestCriteriaScore = criteriaMatrix.rowAverage[0];

    criteriaMatrix.rowAverage.forEach((score, index) => {
        if (score > bestCriteriaScore) {
            bestCriteriaScore = score;
            bestCriteriaIndex = index;
        }
    });

    // 각 기준별로 가장 높은 우선순위를 가진 항목 찾기
    let bestItemName = '';
    let bestItemScore = 0;

    Object.entries(calcResult).forEach(([key, data]) => {
        if (key !== 'criteria-matrix' && data.rowAverage) {
            data.rowAverage.forEach((score, index) => {
                if (score > bestItemScore) {
                    bestItemScore = score;
                    bestItemName = items[index]?.name || `Item ${index + 1}`;
                }
            });
        }
    });

    // 결과 업데이트
    const bestItemNameElement = document.querySelector('#best-item-name');
    const bestItemScoreElement = document.querySelector('#best-item-score');

    if (bestItemNameElement) bestItemNameElement.textContent = bestItemName;
    if (bestItemScoreElement) bestItemScoreElement.textContent = bestItemScore.toFixed(4);

    // summaryContainer.classList.remove('d-none');

    // 최종 결론 카드 업데이트
    updateFinalConclusion(calcResult);
}

/**
 * 최종 결론 카드를 업데이트하는 함수
 * @param {Object} calcResult - 계산 결과
 */
function updateFinalConclusion(calcResult) {
    const finalConclusionContainer = document.querySelector('#final-conclusion');

    // criteria-matrix에서 기준별 중요도 가져오기
    const criteriaMatrix = calcResult['criteria-matrix'];
    if (!criteriaMatrix || !criteriaMatrix.rowAverage) return;

    // 각 항목별로 가중 점수 계산
    const weightedScores = [];

    // 기준별 가중치 가져오기
    const criteriaWeights = criteriaMatrix.rowAverage;

    // 각 항목별로 가중 점수 계산 (한 번만)
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const itemName = items[itemIndex]?.name || `Item ${itemIndex + 1}`;
        let totalWeightedScore = 0;

        // 각 기준별로 가중 점수 계산
        criteriaWeights.forEach((weight, index) => {
            totalWeightedScore += weight * calcResult[`criteria-${index+1}`].rowAverage[itemIndex];
        });

        weightedScores.push({
            name: itemName,
            score: totalWeightedScore,
            itemIndex: itemIndex
        });
    }

    // 가중 점수로 정렬 (높은 순서대로)
    weightedScores.sort((a, b) => b.score - a.score);

    // 가중 점수 테이블 업데이트
    const tbody = document.querySelector('#weighted-scores-tbody');
    if (tbody) {
        tbody.innerHTML = '';

        weightedScores.forEach((item, index) => {
            const row = document.createElement('tr');

            // 순위
            const rankCell = document.createElement('td');
            rankCell.textContent = index + 1;
            row.appendChild(rankCell);

            // 항목명
            const nameCell = document.createElement('td');
            nameCell.textContent = item.name;
            row.appendChild(nameCell);

            // 가중 점수
            const scoreCell = document.createElement('td');
            scoreCell.textContent = item.score.toFixed(4);
            row.appendChild(scoreCell);

            // 평가
            const evaluationCell = document.createElement('td');
            if (index === 0) {
                evaluationCell.textContent = '🏆 최고';
                evaluationCell.style.color = '#2e7d32';
                evaluationCell.style.fontWeight = 'bold';
            } else if (index === weightedScores.length - 1) {
                evaluationCell.textContent = '⚠️ 최하';
                evaluationCell.style.color = '#c62828';
                evaluationCell.style.fontWeight = 'bold';
            } else {
                evaluationCell.textContent = '보통';
            }
            row.appendChild(evaluationCell);

            tbody.appendChild(row);
        });
    }

    // 최고/최하 항목 정보 업데이트
    if (weightedScores.length > 0) {
        const bestItem = weightedScores[0];
        const worstItem = weightedScores[weightedScores.length - 1];

        const finalBestName = document.querySelector('#final-best-name');
        const finalBestScore = document.querySelector('#final-best-score');
        const finalWorstName = document.querySelector('#final-worst-name');
        const finalWorstScore = document.querySelector('#final-worst-score');

        if (finalBestName) finalBestName.textContent = bestItem.name;
        if (finalBestScore) finalBestScore.textContent = bestItem.score.toFixed(4);
        if (finalWorstName) finalWorstName.textContent = worstItem.name;
        if (finalWorstScore) finalWorstScore.textContent = worstItem.score.toFixed(4);
    }

    // 최종 결론 카드 표시
    finalConclusionContainer.classList.remove('d-none');
}

/**
 * @param { String } chr
 * @param { Number } iterCount
 * @returns { String }
 */
const repeatChr = (chr, iterCount) => Array.from(Array(iterCount).keys()).map(el=>chr).join("");

const sumRow = array1d => array1d.reduce((acc, cur) => (acc+cur), 0);
/**
 * @param {HTMLTableElement} tbl
 */
const matMul = (mat1, mat2) => {
    // Check if multiplication is possible (number of columns in A must equal number of rows in B)
    if (mat1[0].length !== mat2.length) {
        throw new Error("Matrix dimensions do not match for multiplication.");
    }

    const result = [];

    // Initialize the result matrix with zeros
    for (let i = 0; i < mat1.length; i++) {
        result[i] = [];
        for (let j = 0; j < mat2[0].length; j++) {
            result[i][j] = 0;
        }
    }

    // Perform matrix multiplication
    for (let i = 0; i < mat1.length; i++) {
        for (let j = 0; j < mat2[0].length; j++) {
            for (let k = 0; k < mat2.length; k++) {
                result[i][j] += mat1[i][k] * mat2[k][j];
            }
        }
    }

    return result;
}
const exportResult = () => {
    let forms = Array.from(document.querySelectorAll("form"));
    const saveData = Object.fromEntries(forms.map(form=>{
        let data = Object.fromEntries(Array.from(form.querySelectorAll("[name]")).map(input=>[input.name, input.value]))
        return [form.id, data];
    }));
    saveTextAsFile(JSON.stringify(saveData), `AHP_save.json`);
    return saveData
}
const copyResultURL = async () => {
    let forms = Array.from(document.querySelectorAll("form"));
    const saveData = Object.fromEntries(forms.map(form=>{
        let data = Object.fromEntries(Array.from(form.querySelectorAll("[name]")).map(input=>[input.name, input.value]))
        return [form.id, data];
    }));
    const jsonString = JSON.stringify(saveData);
    const b64String = btoa(jsonString);
    console.log(b64String);
    await navigator.clipboard.writeText(`${location.origin}?data=${b64String}`);
    alert("url has been copied!");
}
document.querySelector(`#export-data-button`).addEventListener("click", e=>{
    exportResult();
});
document.querySelector(`#copy-data-button`).addEventListener("click", e=>{
    copyResultURL();
});
document.querySelector(`#import-data-button`).addEventListener("click", async e=>{
    let data = await new Promise(resolve=>{
        let textData = '';

        // Create an invisible file input element dynamically
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';  // Optional: specify file types (e.g., only .txt files)

        // Callback function for file selection event
        function handleFileSelect(event) {
          const file = event.target.files[0];  // Get the selected file

          if (file) {
            const reader = new FileReader();  // Create a new FileReader instance

            // Callback function for file read success
            reader.onload = function(e) {
              // The file content will be available in e.target.result
              textData = e.target.result;
              fileInput.remove();
              resolve(textData);
            };

            // Read the file as text (UTF-8 encoded)
            reader.readAsText(file);
          } else {
            alert('Please select a file.');
          }
        }

        // Set up the event listener for file selection
        fileInput.addEventListener('change', handleFileSelect);

        // Trigger the file dialog when the button is clicked
        fileInput.click();
    });
    const exportedData = JSON.parse(data);
    importResult(exportedData);
});
/**
 * @param { Object } exportedData
 */
const importResult = (exportedData) => {
    Object.entries(exportedData).forEach(([formId, data])=>{
        /** @type {HTMLFormElement} */
        const form = document.querySelector(`form#${formId}`);
        Object.entries(data).forEach(([inputName, value])=>{
            form.querySelector(`[name="${inputName}"]`).value = value;
            form.querySelector(`[name="${inputName}"]`).dispatchEvent(new Event("input"));
        });
        if (form.reportValidity()) form.dispatchEvent(new Event("submit"));

    });
    document.querySelectorAll(".data-matrix").forEach(matrix=>matrix.dispatchEvent(new Event("input")));
}
function saveTextAsFile(text, filename) {
    // Create a Blob object with the text data
    const blob = new Blob([text], { type: 'text/plain' });

    // Create a temporary URL for the Blob object
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement('a');

    // Set the download attribute with the filename
    link.download = filename;

    // Set the href attribute to the Blob URL
    link.href = url;

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up the Blob URL after the download
    URL.revokeObjectURL(url);
  }


const fillInputs = () => {
    document.querySelectorAll(`form#step-2-form .data-matrix`).forEach(dataMatrixContainer => {
        dataMatrixContainer.querySelectorAll("input").forEach(input=>{
            const names = input.name.split("__");
            if (names.at(-2) < names.at(-1)) {
                input.value = parseInt(Math.random() * 7) + 2;
                dataMatrixContainer.querySelector(`input[name$="${names.at(-1)}__${names.at(-2)}"]`).value = 1 / (+input.value);
            }
        });
    })
}

(()=>{
    const searchParams = new URLSearchParams(location.search);
    if (!searchParams.get("data")) return;
    const dataJsonText = JSON.parse(atob(searchParams.get("data")));
    importResult(dataJsonText);
    history.replaceState({}, null, '');
})();