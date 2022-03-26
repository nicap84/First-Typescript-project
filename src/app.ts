//Validation
interface Validatable {
    value: string | number;
    required: boolean;
    // ? is to say that this param is optional
    minLength?: number;  
    maxLength?: number;
    min?: number;
    max?: number;
} 

function validate(validatableInput: Validatable): boolean{
    let isValid = true;
    if (validatableInput.required){
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength != null && typeof validatableInput.value == 'string'){
        isValid= isValid && validatableInput.value.length > validatableInput.minLength;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value == 'string'){
        isValid= isValid && validatableInput.value.length > validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value == 'number'){
        isValid= isValid && validatableInput.value > validatableInput.min;
    }
    if (validatableInput.max != null && typeof validatableInput.value == 'number'){
        isValid= isValid && validatableInput.value > validatableInput.max;
    }
    return isValid;
}


// Autobin decorator
function autobind(
    _: any,
    _2: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
      configurable: true,
      get() {
        const boundFn = originalMethod.bind(this);
        return boundFn;
      }
    };
    console.log(adjDescriptor);
    return adjDescriptor;
  }

// Project input class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    // Element where we will render our template
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        //<> and as is type casting
        this.templateElement = <HTMLTemplateElement> document.getElementById('project-input')!;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
    
        // Render the template
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        // Add id 'user-input' to the form element (for css)
        this.element.id = 'user-input';
        // Acess to the inputs
        this.titleInputElement =<HTMLInputElement> this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.attach();
    }

    //tupla
    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable : Validatable = {
            value: enteredTitle,
            required: true,
        }

        const descriptionValidatable : Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }

        const peopleValidatable : Validatable = {
            value: enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        //validation
        if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)){
        //if (enteredTitle.trim().length === 0 || enteredDescription.trim().length === 0 || enteredPeople.trim().length === 0){
            alert('There is some input empty');
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    // Event steps
    private submitHandler(event: Event) {
        event.preventDefault();
        console.log('submitHandler', this.titleInputElement.value);
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)){
            const [title, description, people] = userInput;
            console.log (title, description, people);
            this.clearInputs();
        }
    }

    // Add event listener
    // TODO fix @autobind
    private configure() {
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }

    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const printInput = new ProjectInput();