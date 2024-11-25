import {html, createYoffeeElement} from "../../libs/yoffee/yoffee.min.js"
import {
    GlobalState,
} from "../state.js";
import "../components/text-input.js"
import "../components/x-loader.js"
import "../components/x-button.js"
import "../components/x-icon.js"
import "../components/x-tag.js"
import "../components/x-dialog.js"
import "../components/x-switch.js"
import "../components/x-double-slider.js"


const SORT_TYPES = {
    NEWEST: "New",
    RATING: "Rating",
    MOST_SENDS: "Most sends",
    LEAST_SENDS: "Least sends",
    OLDEST: "Old",
}

const FILTER_TYPES = {
    GRADE: "Grade",
    RATING: "Rating",
    LIKED_ROUTES: "Liked routes",
}


createYoffeeElement("routes-filter", (props, self) => {
    let state = {
        editedFilterType: null
    }

    function setFilter(filterType, value) {
        let existingFilter = GlobalState.filters.find(filter => filter.type === filterType)
        if (existingFilter != null) {
            existingFilter.value = value
        } else {
            GlobalState.filters.push({type: filterType, value})
        }
        GlobalState.filters = [...GlobalState.filters]
    }

    return html(GlobalState, state)`
<style>
    :host {
        display: flex;
        overflow-x: auto;
        min-height: fit-content;
        gap: 2px;
        margin-top: 3px;
        padding-bottom: 5px;
    }
    
    .tag {
        display: flex;
        align-items: center;
        border-radius: 100px;
        font-size: 12px;
        padding: 5px 10px;
        gap: 3px;
        background-color: var(--secondary-color-weak-3);
        border: 0 solid var(--secondary-color);
        color: var(--secondary-color);
        box-shadow: none;
        white-space: nowrap;
        min-width: fit-content;
    }
    
    .tag > .delete-icon {
        padding: 3px;
    }
    
    .dropdown-list-dialog > .item {
        padding: 10px 20px;
        cursor: pointer;
    }
    
    .dropdown-list-dialog > .item:hover {
        background-color: var(--hover-color);
    }
    
    #sorting-tag > x-icon {
        transform: rotate(90deg) scaleX(0.8);;
    }
    
    #sorting-dialog > .sort-type[data-selected] {
        color: var(--secondary-color);
    }
    
    #add-filter-tag {
        border: none;
        background-color: var(--background-color-3);
        color: var(--text-color-weak-1);
    }
    
    #v-slider-container {
        display: flex;
        width: 80vw;
        gap: 20px;
        padding: 10px 20px;
        align-items: center;
    }
    
    #v-slider-container > .v-number {
        min-width: 22px;
        max-width: 22px;
    }
    
    x-double-slider {
        --circle-color: var(--secondary-color);
        width: 80vw;
    }
    
    .stars-container {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .stars-container > .stars {
        color: #BFA100;
        display: flex;
        font-size: 12px;
        margin-left: auto;
    }
    
</style>

<x-button 
    id="sorting-tag"
    class="tag"
    tabindex="0"
    onmousedown=${() => () => {
        let _dropdown = self.shadowRoot.querySelector("#sorting-dialog")
        let _button = self.shadowRoot.querySelector("#sorting-tag")
        if (_dropdown.isOpen()) {
            _dropdown.close()
        } else {
            _dropdown.open({
                x: _button.offsetLeft,
                y: _button.offsetTop + _button.offsetHeight + 5
            }, true)
        }
    }}
    onblur=${() => requestAnimationFrame(() => self.shadowRoot.querySelector("#sorting-dialog").close())}>
    <x-icon icon="fa fa-exchange-alt"></x-icon>
    Sort by: ${() => GlobalState.sorting}
</x-button>
<x-dialog id="sorting-dialog"
          class="dropdown-list-dialog">
    ${() => [...Object.values(SORT_TYPES)].map(sortType => html()`
    <div class="sort-type item"
         data-selected=${() => GlobalState.sorting === sortType}
         onclick=${() => {
             self.shadowRoot.querySelector("#sorting-dialog").close()
             GlobalState.sorting = sortType
         }}>
        ${sortType}
    </div>
    `)}
</x-dialog>

${() => GlobalState.filters.map(filter => html()`
<x-button class="tag"
          tabindex="0"
          onmousedown=${e => {
              if (filter.type === FILTER_TYPES.GRADE) {
                  let _dropdown = self.shadowRoot.querySelector("#edit-filter-dialog")
                  if (_dropdown.isOpen()) {
                      _dropdown.close()
                  } else {
                      state.editedFilterType = filter.type
                      let target = e.target
                      _dropdown.open({
                          x: target.offsetLeft,
                          y: target.offsetTop + target.offsetHeight + 5
                      }, true)
                  }
              } else if (filter.type === FILTER_TYPES.RATING) {
                  filter.value += 1
                  if (filter.value > 3) {
                      filter.value = 1
                  }
                  setFilter(FILTER_TYPES.RATING, filter.value)
              } else if (filter.type === FILTER_TYPES.LIKED_ROUTES) {
                  GlobalState.filters = GlobalState.filters.filter(f => f.type !== FILTER_TYPES.LIKED_ROUTES)
              }
          }}
          onblur=${() => requestAnimationFrame(() => self.shadowRoot.querySelector("#edit-filter-dialog").close())}>
    ${() => {
        if (filter.type === FILTER_TYPES.GRADE) {
            return filter.value.min === filter.value.max ? `Grade: V${filter.value.min}` : `Grade: V${filter.value.min} - V${filter.value.max}`
        } else if (filter.type === FILTER_TYPES.RATING) {
            return html()`
            <div class="stars-container">
                <div>Rating: </div>
                <div class="stars">
                    ${() => filter.value > 0 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
                    ${() => filter.value > 1 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
                    ${() => filter.value > 2 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
                </div>
            </div>
            `
        } else if (filter.type === FILTER_TYPES.LIKED_ROUTES) {
            return html()`
            <div style="display: flex; align-items: center; gap: 5px;">
                <x-icon icon="fa fa-heart" style="color: var(--love-color);"></x-icon>
                Liked
            </div>
            `
        }
    }}
    <x-icon class="delete-icon" 
            icon="fa fa-times"
            onmousedown=${e => {
                GlobalState.filters = GlobalState.filters.filter(f => f.type !== filter.type)
                e.stopPropagation()
            }}></x-icon>
</x-button>
`)}
<x-dialog id="edit-filter-dialog">
    ${() => {
        let existingFilter = GlobalState.filters.find(filter => filter.type === state.editedFilterType)
        let thisDialog = self.shadowRoot.querySelector("#edit-filter-dialog")
        if (state.editedFilterType === FILTER_TYPES.GRADE) {
            if (existingFilter == null) {
                return
            }
            let sliderState = {min: existingFilter.value.min || 0, max: existingFilter.value.max || 0}
            return html(sliderState)`
            <div id="v-slider-container">
                <div class="v-number">V${() => sliderState.min}</div>
                <x-double-slider initvaluemin=${existingFilter.value.min}
                                 initvaluemax=${existingFilter.value.max}
                                 min="0"
                                 max="18"
                                 step
                                 updated=${() => ({min, max}) => {
                                     existingFilter.min = Math.round(min)
                                     existingFilter.max = Math.round(max)
                                     sliderState.min = existingFilter.min
                                     sliderState.max = existingFilter.max
                                 }}
                                 released=${() => () => {
                                     setFilter(FILTER_TYPES.GRADE, existingFilter)
                                     requestAnimationFrame(() => self.shadowRoot.querySelector("#edit-filter-dialog").close())
                                 }}>
                </x-double-slider>
                <div class="v-number">V${() => sliderState.max}</div>
            </div>
            `
        } else if (state.editedFilterType === FILTER_TYPES.RATING) {
            if (existingFilter == null) {
                return
            }
            return html()`
            <div class="stars">
                ${() => existingFilter.value > 0 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
                ${() => existingFilter.value > 1 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
                ${() => existingFilter.value > 2 ? html()`<x-icon icon="fa fa-star"></x-icon>` : ""}
            </div>
            `
        }
    }}
</x-dialog>

<x-button id="add-filter-tag"
          class="tag"
          tabindex="0"
          onmousedown=${() => () => {
              let _dropdown = self.shadowRoot.querySelector("#add-filter-dialog")
              let _button = self.shadowRoot.querySelector("#add-filter-tag")
              if (_dropdown.isOpen()) {
                  _dropdown.close()
              } else {
                  _dropdown.open({
                      x: _button.offsetLeft,
                      y: _button.offsetTop + _button.offsetHeight + 5
                  }, true)
              }
          }}
          onblur=${() => {
              requestAnimationFrame(() => self.shadowRoot.querySelector("#add-filter-dialog").close())
              requestAnimationFrame(() => self.shadowRoot.querySelector("#edit-filter-dialog").close())
          }}>
    Add filter
    <x-icon icon="fa fa-plus"></x-icon>
</x-button>
<x-dialog id="add-filter-dialog" 
          class="dropdown-list-dialog">
    ${() => [...Object.values(FILTER_TYPES)]
        .filter(filterType => !GlobalState.filters.find(filter => filter.type === filterType))
        .map(filterType => html()`
    <div class="filter-type item"
         onclick=${() => {
             let elementToOpenDialogOn = self.shadowRoot.querySelector("#add-filter-tag")
             self.shadowRoot.querySelector("#add-filter-dialog").close()
            
             if (filterType === FILTER_TYPES.GRADE) {
                 setFilter(FILTER_TYPES.GRADE, {min: 0, max: 18})
                 elementToOpenDialogOn = self
             } else if (filterType === FILTER_TYPES.RATING) {
                 setFilter(FILTER_TYPES.RATING, 1)
                 elementToOpenDialogOn = null
             } else if (filterType === FILTER_TYPES.LIKED_ROUTES) {
                 setFilter(FILTER_TYPES.LIKED_ROUTES, true)
                 elementToOpenDialogOn = null
             }
             
             
             if (elementToOpenDialogOn != null) {
                 state.editedFilterType = filterType
                 self.shadowRoot.querySelector("#edit-filter-dialog").open({
                     x: elementToOpenDialogOn.offsetLeft,
                     y: elementToOpenDialogOn.offsetTop + elementToOpenDialogOn.offsetHeight + 5
                 }, true)
             }
         }}>
        ${filterType}
    </div>
    `)}
</x-dialog>
`
})

export {SORT_TYPES, FILTER_TYPES}