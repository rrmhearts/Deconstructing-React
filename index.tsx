let React = {
    App: undefined,
    Root: undefined,
    counter: 0,

    // This happens first on the JSX code, <App /> calls this.
    createElement: (tag, props, ...children) => {
        if (!React.App) React.App = {tag, props: {...props, children}};
        if (typeof tag === "function"){
            try {
                return tag(props);
            } catch ({promise, key}) {
                promise.then(data => {
                    console.log(promise);
                    promiseCache.set(key,data);
                    React.stateChange();
                });
                return {
                    tag: 'h1', 
                    props: {
                        children: ['I AM LOADING']
                    }
                }
            }
        }
        let element = {tag, props: {...props, children}};
        return element;
    },
    render: (reactElement, container) => {
        if (!React.Root) React.Root = container;

        if(['string','number'].includes(typeof reactElement)){
            container.appendChild(document.createTextNode(String(reactElement)));
            return;
        }
        const actualDomElement = document.createElement(reactElement.tag);
        if (reactElement.props) {
            Object.keys(reactElement.props).filter(p => p != 'children').forEach(p => actualDomElement[p] = reactElement.props[p]);
        }
        if (reactElement.props.children) {
            reactElement.props.children.forEach(child => React.render(child, actualDomElement));
        }
        //append root to the container
        container.appendChild(actualDomElement);
    },
    stateChange: () => {
        stateCursor = 0;
        React.Root.firstChild.remove();

        console.log('first child', React.Root.firstChild)
        console.log('app', React.App);
        ({ children, ...props } = React.App.props);
        React.render(React.createElement(React.App.tag, props, children), React.Root);
    }
};

// Know if data is ready we implement cache, a closure, not global
const promiseCache = new Map();

const createResouce = (thingThatReturnsSomething, key) => {
    if (promiseCache.has(key)){
        return promiseCache.get(key);
    }
    throw {promise: thingThatReturnsSomething(), key};
}

//Moving parts of our app
const states = []
let stateCursor = 0;

const useState = (initialState) => {
    const FROZENCURSOR = stateCursor;
    states[FROZENCURSOR] = states[FROZENCURSOR] || initialState;
    
    console.log(states);
    const setState = (newState) => {
        states[FROZENCURSOR] = newState;
        React.stateChange();
        };
    stateCursor++;

    return [states[FROZENCURSOR], setState]
}


const App = () => {
    const [name, setName] = useState("person");
    const [count, setCount] = useState(0);
    const  dogPhotoUrl = createResouce(() => fetch("https://dog.ceo/api/breeds/image/random")
            .then(r => r.json())
            .then(payload => payload.message), 'dogPhoto');
    
    return (
        <div className="react-2020">
            <h1>Hello, {name}!</h1>
            <input value={name}
                   onchange={e => setName(e.target.value)}
                   type="text"
                   placeholder="name" />
            <h2>The count is: {count}</h2>
            <img alt="good boi" src={dogPhotoUrl} />
            <button onclick={() => setCount(count + 1)}>+</button>
            <button onclick={() => setCount(count - 1)}>-</button>
        </div>
    );
};

React.render(<App />, document.querySelector('#app'));
