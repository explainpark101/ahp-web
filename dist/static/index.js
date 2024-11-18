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
    console.log(calcData);
    // calculation result showing
});


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