import * as DOM from "./dom.js";
import { DropDown } from "./downdrop.js";

const branchDropDown = new DropDown(DOM.dropDownTrigger, DOM.dropDownList, DOM.dropDownLabel);

export default branchDropDown;
