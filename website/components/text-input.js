import {YoffeeElement, createYoffeeElement, html} from "../libs/yoffee/yoffee.min.js";


customElements.define("text-input", class extends YoffeeElement {
    connectedCallback() {
        if (this.props.value) {
            this.setValue(this.props.value);
        }
    }

    propUpdated(prop) {
        if (prop === "value") {
            this.setValue(this.props.value);
        }
    }

    render() {
        //language=HTML
        return html(this.props, this.state)`
            <style>
                :host {
                    display: flex;
                    border-radius: 5px;
                    font-size: 18px;
                }
                
                input {
                    width: -webkit-fill-available;
                    width: -moz-available;
                    border: none;
                    outline: none;
                    background-color: var(--background-color, #00000010);
                    padding: var(--padding, 10px 20px);
                    
                    font-size: inherit;
                    border-radius: inherit;
                    caret-color: #404040;
                    color: inherit;
                    font-family: inherit;
                }
                
                ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
                    color: #404040;
                    opacity: 0.6; /* Firefox */
                    user-select: none;
                }
                
                /* Chrome, Safari, Edge, Opera */
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
                
                /* Firefox */
                input[type=number] {
                  -moz-appearance: textfield;
                }
            </style>
            <style>
            ${() => this.state.rtl && `
            input {
                direction: rtl;
            }
            `}
            </style>
            <input type="${() => this.props.type}"
                   placeholder="${() => this.props.placeholder}"
                   onchange=${() => this.props.changed && this.props.changed()}
                   onfocus=${() => this.props.focused && this.props.focused()}
                   onkeyup=${e => {
            this.props.keyup && this.props.keyup();
            this.calcRtl(e)
        }}
                   onkeydown=${e => this.props.keydown && this.props.keydown()}
                   onkeypress=${e => {
            if (e.key === 'Enter') {
                this.props.submitted && this.props.submitted()
            }
            this.props.keydown && this.props.keydown()
        }}>
        `
    }

    getValue() {
        return this.shadowRoot.querySelector("input").value
    }

    setValue(value) {
        if (value === true) {
            value = ""
        }
        return this.shadowRoot.querySelector("input").value = value
    }

    focus() {
        return this.shadowRoot.querySelector("input").focus()
    }

    calcRtl(e) {
        let value = this.getValue().trim();
        let match = value.match(/[\u0590-\u05FF]/);
        let rtl = match != null && match.index === 0;
        if (rtl !== this.state.rtl) {
            this.state.rtl = rtl;
        }
    }
});