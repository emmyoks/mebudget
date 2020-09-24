
var budgetController = (function(){

    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalInc){
        if(totalInc > 0 && totalInc > this.value){
            this.percentage = Math.round((this.value / totalInc)*100);
        }else{
            this.percentage = -1;
        }
    }
    let data = {
        allItems:{
            inc:[],
            exp:[]
        },
        total:{
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };
    function calculateTotal(type){
        let sum = 0;
        data.allItems[type].forEach(curr =>{
            sum += curr.value;
        })
        data.total[type] = sum;
    }

    return {
        addItem: function(type, desc, val){
            let ID, newItem;

            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }

            if(type === 'inc'){
                newItem = new Income(ID, desc, val);
            }else if(type === 'exp'){
                newItem = new Expense(ID, desc, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        calculateBudget: function(){
            calculateTotal('inc');
            calculateTotal('exp');

            data.budget = data.total.inc - data.total.exp;
            if(data.total.inc != 0 && data.total.inc > data.total.exp){
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },
        getBudget: function(){
            return{
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                budget: data.budget,
                percentage: data.percentage
            }
        },
        deleteItem: function(type,id){
            let IDs, index;
            IDs = data.allItems[type].map(curr => {
               return curr.id
            })
            index = IDs.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        getPercentages: function(){
            data.allItems.exp.forEach(curr => {
                curr.calcPercentage(data.total.inc);
            })
            let Percentages = data.allItems.exp.map(curr => {
                return curr.percentage
            })
            return Percentages
        },
        checkData: function(){
            console.log(data)
        }
    }
})()


var UIController = (function(){

    let inputList;
    let DOMStrings = {
        inputType: ".add-type",
        description: ".add-description",
        inputValue: ".add-value",
        addBtn: ".add-btn",
        incomeList: ".income-list",
        expensesList: ".expenses-list",
        budgetLabel: ".budget-value",
        incomeLabel: ".budget-income-value",
        expensesLabel:".budget-expenses-value",
        percentageLabel:".budget-expenses-percentage",
        itemContainer: ".container",
        expPercent:".item-percentage",
        dateLabel:".budget-title-month",
        topContainer:".top"
    };
    inputList = document.querySelectorAll(DOMStrings.description + ',' + DOMStrings.inputValue);
    function numFormat(num){
        num = (num).toFixed(2);
        num = Intl.NumberFormat().format(num);
        return num
    }

    return {
        getInput: function(){
            return{
                getType: document.querySelector(DOMStrings.inputType).value,
                getDescription: document.querySelector(DOMStrings.description).value,
                getValue: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        currentDate: function(){
            let now, month, year,months;
            now =  new Date();
            months = ["January", "Febuary", "March", "April", "May", "June", "July", "August"
            , "September", "October", "November", "December"];
            year = now.getFullYear();
            month = now.getMonth();
            month = months[month];
            document.querySelector(DOMStrings.dateLabel).textContent = month +' '+ year;
        },
        insertItem: function(obj,type){
            let html,element;
            if(type === 'inc'){
                element = DOMStrings.incomeList;
                html = ` <div class="item clearfix" id="inc-${obj.id}"> <div class="item-description">${obj.description}</div>
                    <div class="right clearfix"> <div class="item-value">+ ${numFormat(obj.value)}</div>
                    <div class="item-delete"> <button class="fas fa-times item-delete-btn"></button>
                    </div> </div> </div>`;
            }else if(type === 'exp'){
                element = DOMStrings.expensesList;
                html = `<div class="item clearfix" id="exp-${obj.id}"> <div class="item-description">${obj.description}</div>
                    <div class="right clearfix"> <div class="item-value">- ${numFormat(obj.value)}</div>
                    <div class="item-percentage">21%</div> <div class="item-delete">
                    <button class="fas fa-times item-delete-btn"></button> </div> </div> </div>`
            }
            document.querySelector(element).insertAdjacentHTML('beforeend',html);
        },
        clearInputs: function(){
            //  can convert the list to an array with:
            //  let arr = Array.prototype.slice.call(inputList)
            // But i dont see why i shoud do that, Since list has all the needed prototype
            inputList.forEach((curr)=>{
                curr.value = "";
                inputList[0].focus();
            })
        },
        moveFocus: function(x){
            // This will later be usedd in the appcontroller to switch focus when the user click the enter key
            inputList[x].focus();
        },
        deleteItem: function(ID){
            let element = document.getElementById(ID);
            element.parentNode.removeChild(element);
        },
        getDOMStrings: function(){
            return DOMStrings;
        },
        displayBudget: function(obj){

            document.querySelector(DOMStrings.budgetLabel).textContent = numFormat(obj.budget);
            document.querySelector(DOMStrings.incomeLabel).textContent = "+ " + numFormat(obj.totalInc);
            document.querySelector(DOMStrings.expensesLabel).textContent = "- " + numFormat(obj.totalExp);

            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";
            }
        },
        typeChange: function(){
            let doc;
            doc = document.querySelectorAll(DOMStrings.inputType + ','
            + DOMStrings.description + ',' + DOMStrings.inputValue);
            doc.forEach(curr => {
                curr.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.addBtn).classList.toggle('red');
        },
        displayPercentage: function(perc){
            let nodeList,i=0;
            nodeList = document.querySelectorAll(DOMStrings.expPercent);
            nodeList.forEach(curr=> {
                if(perc[i] > 0){
                    curr.textContent = perc[i] + ' %';
                }else {
                    curr.textContent = "---";
                }
                i++;
            })
        },
        randomBackImage: function(){
            let randomNum;
            randomNum = (Math.floor(Math.random()*3) + 1);
            Dom = document.querySelector(DOMStrings.topContainer);
            Dom.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(bg${randomNum}.jpeg)`;
        }
    }

})()


var appController = (function(budget,UI){
    let DOMStrings = UI.getDOMStrings();
    
    // Updating Budget
    function updateBudget(){
        budget.calculateBudget();
        let budgetData = budget.getBudget();
        UI.displayBudget(budgetData);
        UI.randomBackImage();
    }
    // Updating Expense item percentage
    function updateExpPercentage(){
       let percentages = budget.getPercentages();
       UI.displayPercentage(percentages);
    }

    // Getting items from the UI and returning result to the ui
    function addItems(){
        let input, newItem;
        input = UI.getInput();

        if(input.getDescription !== "" && isNaN(input.getValue)){
            UI.moveFocus(1)
        }else if(input.getDescription !== "" && !isNaN(input.getValue) && input.getValue > 0){
            newItem = budget.addItem(input.getType, input.getDescription, input.getValue);
            UI.insertItem(newItem, input.getType);
            UI.clearInputs();
            updateBudget();
            updateExpPercentage();
        }

    }
    function deleteItem(e){
        let itemID,splitID,ID, type;
        itemID = e.target.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budget.deleteItem(type,ID);
            UI.deleteItem(itemID);
            updateBudget();
            updateExpPercentage();
        }
    }
    // EventListeners
    document.querySelector(DOMStrings.itemContainer).addEventListener('click', deleteItem)
    // Keypress and addBtn Click.
    document.querySelector(DOMStrings.addBtn).addEventListener('click',addItems);
    document.addEventListener('keypress', e =>{
        if(e.keyCode === 13){
            addItems()
        }
    })
    document.querySelector(DOMStrings.inputType).addEventListener('change',UI.typeChange)

    return{
        init:function(){
            UI.currentDate();
            UI.randomBackImage();
            UI.displayBudget({
                totalInc: 0,
                totalExp: 0,
                budget: 0,
                percentage: -1
            });
        }
    }
})(budgetController, UIController)

appController.init();