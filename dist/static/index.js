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
            <input type="text" id="item-name-${this.no}" form="step-1-form" />
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
            <label for="criteria-name-${this.no}">Item ${this.no} Name</label>
            <input type="text" id="criteria-name-${this.no}" form="step-1-form" />
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
    items.forEach(item=>document.querySelector(`#item-names`).appendChild(item.nameInput));
    criterias.forEach(criteria=>document.querySelector(`#criteria-names`).appendChild(criteria.nameInput));
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
                        <input form="step-2-form" name="criteria-${criteria.number}__item-${el.no}__item-${item.no}" type="number" value="1" readonly="readonly"/>
                    </td>
                `
                return `
                    <td>
                        <input form="step-2-form" name="criteria-${criteria.number}__item-${el.no}__item-${item.no}" type="number" step="any"
                            value="0" min="0.1" max="9" pattern="(0\.\d+)|[2-9]"/>
                    </td>
                `
            }).join("\n");
            container.querySelector(`tbody`).insertAdjacentHTML(`beforeend`, `
                <tr>
                    <th>${item.name}</th>
                    ${tableRowHTML}
                </tr>
            `);
            container.addEventListener("input", e=>{
                /** @type { HTMLInputElement } */
                const input = e.target;
                const inputName = e.target.name;
                input.reportValidity();
                const [criteriaNo, item1No, item2No] = inputName.split("__");
                container.querySelector(`input[name="${criteriaNo}__${item2No}__${item1No}"]`).value = 1 / (+e.target.value);
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
                        <input form="step-2-form" name="criteria-${el.no}__criteria-${criteria1.no}" type="number" value="1" readonly="readonly"/>
                    </td>
                `
                return `
                    <td>
                        <input form="step-2-form" name="criteria-${el.no}__criteria-${criteria1.no}" type="number" value="0" min="0.1" max="9" step="any" pattern="(0\.\d+)|[2-9]"/>
                    </td>
                `
            }).join("\n");
            container.querySelector(`tbody`).insertAdjacentHTML(`beforeend`, `
                <tr>
                    <th>${criteria1.name}</th>
                    ${tableRowHTML}
                </tr>
            `);
            container.addEventListener("input", e=>{
                const inputName = e.target.name;
                const [criteria1No, criteria2No] = inputName.split("__");
                container.querySelector(`input[name="${criteria2No}__${criteria1No}"]`).value = 1 / (+e.target.value);
            });
            return container
        }).forEach(el=>contentContainer.appendChild(el));
    })();
    document.querySelector(`form#step-2-form`).classList.remove("d-none");
});
let calcData;
document.querySelector(`form#step-2-form`).addEventListener("submit", e=>{
    e.preventDefault();
    const matrixArray = Array.from(document.querySelectorAll(`.data-matrix`));
    calcData = Object.fromEntries(
        matrixArray.map(matContainer => {
            let id = matContainer.id;
            let values = Array.from(matContainer.querySelectorAll("tbody tr")).map(tr=>{
                return Array.from(tr.querySelectorAll("input")).map(el=>+el.value)
            });
            return [id, values];
        })
    );
    // calculation result showing

    let calcResult = Object.fromEntries(Object.entries(calcData).map(([key, mat], matrixIndex)=>{
        let colIndexes = Array.from(Array(mat[0].length).keys());
        let colTotals = colIndexes.map(i=>mat.map(r=>r[i])).map(row=>sumRow(row));
        let newMatrix = mat.map(row=>row.map((el, idx)=>(el/colTotals[idx])));
        let rowAverage = newMatrix.map(el=>sumRow(el)/el.length);
        let ax = matMul(mat, rowAverage.map(el=>[el])).map(el=>el[0]);
        let lambdaMax = (sumRow(zip(ax, rowAverage).map(([a, b])=>(a/b))) / ax.length);
        const CI = (lambdaMax - ax.length) / (  ax.length - 1);
        const CR = CI / ({
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
        }[ax.length]);

        return [key, {
            CI, CR, newMatrix, rowAverage, ax, lambdaMax
        }];
    }));

    const resultContainer = document.querySelector(`#step-results`);
    resultContainer.innerHTML = '';
    Object.entries(calcResult).forEach(([key, data])=>{
        let article = document.createElement("article");
        let title = matrixIndex >= criterias.length ? "Criteria" : criterias[matrixIndex];
        article.innerHTML = `
            <h4>${title}</h4>
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
                <li class="list-ci">CI: ${data.CI}</li> 
                <li class="list-cr">CR: ${data.CR} </li>
            </ul>
        `;
        article.querySelector(`.list-cr`).insertAdjacentHTML("beforeEnd", data.CR >= .9 ? "<b>Untrustworthy</b>" : data.CR <= .1 ? "<b>TrustWorthy</b>" : '');

        let tblRowElements = data.rowAverage
        .map((el, idx)=>[el, idx]);
        tblRowElements = tblRowElements.sort(([a, adx], [b, bdx])=>b-a);
        tblRowElements = tblRowElements.map(([el, idx])=>{
            let tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${key == "criteria-matrix" ? (criterias[idx]?.name??idx) : (items[idx]?.name??idx)}</td>
                <td>${el}</td>
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
}
document.querySelector(`#export-data-button`).addEventListener("click", e=>{
    exportResult();
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
const importResult = (exportedData) => {
    Object.entries(exportedData).forEach(([formId, data])=>{
        /** @type {HTMLFormElement} */
        const form = document.querySelector(`form#${formId}`);
        Object.entries(data).forEach(([inputName, value])=>{
            form.querySelector(`[name="${inputName}"]`).value = value;
            form.querySelector(`[name="${inputName}"]`).dispatchEvent(new Event("input"));
        });
        form.dispatchEvent(new Event("submit"));
    });
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