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
        this.titleInputElement = document.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = document.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = document.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.attach();
    }

    //tupla
    private gatherUserInput(): [string, string, number] | undefined {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        //validation
        if (enteredTitle.trim().length === 0 || enteredDescription.trim().length === 0 || enteredPeople.trim().length === 0){
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
    // remove bind to use the decorator @autobind
    private configure() {
        // TODO bind is not working
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }

    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const printInput = new ProjectInput();