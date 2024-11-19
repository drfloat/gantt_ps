/** @odoo-module **/
import { visitXML } from "@web/core/utils/xml";
import { Field } from "@web/views/fields/field";
import { addFieldDependencies, archParseBoolean, processButton } from "@web/views/utils";
import { Widget } from "@web/views/widgets/widget";

/**
 * GroupListArchParser handles parsing group list architecture in Odoo 17.
 */
export class GroupListArchParser {
    /**
     * Parse the given architecture and return field and button nodes.
     * @param {string} arch - The XML architecture to parse.
     * @param {Object} models - The models available in the system.
     * @param {string} modelName - The model name.
     * @param {string} jsClass - The JavaScript class to use for processing.
     * @returns {Object} Parsed field nodes and buttons.
     */
    parse(arch, models, modelName, jsClass) {
        const fieldNodes = {};
        const fieldNextIds = {};
        const buttons = [];
        let buttonId = 0;

        visitXML(arch, (node) => {
            if (node.tagName === "button") {
                buttons.push({
                    ...processButton(node),
                    id: buttonId++,
                });
                return false;  // Skip further processing for button nodes.
            } else if (node.tagName === "field") {
                const fieldInfo = Field.parseFieldNode(node, models, modelName, "list", jsClass);
                if (!fieldInfo || !fieldInfo.name) {
                    console.warn(`Skipping invalid field node: ${node.tagName}`, node);
                    return false;  // Skip invalid field nodes.
                }
                if (!(fieldInfo.name in fieldNextIds)) {
                    fieldNextIds[fieldInfo.name] = 0;
                }
                const fieldId = `${fieldInfo.name}_${fieldNextIds[fieldInfo.name]++}`;
                fieldNodes[fieldId] = fieldInfo;
                node.setAttribute("field_id", fieldId);
                return false;  // Skip further processing for field nodes.
            }
        });

        return { fieldNodes, buttons };
    }
}

/**
 * GanttPSArchParser handles parsing Gantt chart architecture in Odoo 17.
 */
export class GanttPSArchParser {
    /**
     * Check if a column is visible based on the column invisible modifier.
     * @param {boolean} columnInvisibleModifier - The column invisible modifier.
     * @returns {boolean} - True if the column is visible, false otherwise.
     */
    isColumnVisible(columnInvisibleModifier) {
        return columnInvisibleModifier !== true;
    }

    /**
     * Parse a field node and return the parsed field information.
     * @param {Node} node - The field node to parse.
     * @param {Object} models - The models information.
     * @param {string} modelName - The name of the model.
     * @returns {Object|null} - The parsed field information, or null if invalid.
     */
    parseFieldNode(node, models, modelName) {
        const fieldInfo = Field.parseFieldNode(node, models, modelName, "gantt_ps");
        if (!fieldInfo || !fieldInfo.name) {
            console.warn(`Skipping invalid field node: ${node.tagName}`, node);
            return null;
        }
        return fieldInfo;
    }

    /**
     * Parse a widget node and return the parsed widget information.
     * @param {Node} node - The widget node to parse.
     * @returns {Object} - The parsed widget information.
     */
    parseWidgetNode(node) {
        return Widget.parseWidgetNode(node);
    }

    /**
     * Process a button node and return the processed button data.
     * @param {Node} node - The button node to process.
     * @returns {Object} - The processed button information.
     */
    processButton(node) {
        return processButton(node);
    }

    /**
     * Parse the Gantt view architecture.
     * @param {string} xmlDoc - The XML architecture to parse.
     * @param {Object} models - The models available in the system.
     * @param {string} modelName - The model name.
     * @returns {Object} - The parsed Gantt view architecture.
     */
    parse(xmlDoc, models, modelName) {
        const fieldNodes = {};
        const widgetNodes = {};
        const columns = [];
        const activeFields = {};
        const fieldNextIds = {};
        const fields = models[modelName] || {};
        const groupListArchParser = new GroupListArchParser();
        const groupBy = {
            buttons: {},
            fields: {},
        };

        let widgetNextId = 0;
        let buttonId = 0;
        let nextId = 0;
        let headerButtons = [];
        let buttonGroup;
        let handleField = null;
        const creates = [];
        const treeAttr = { limit: 200 };

        visitXML(xmlDoc, (node) => {
            if (node.tagName === "field") {
                const fieldInfo = this.parseFieldNode(node, models, modelName);
                if (!fieldInfo) {
                    console.warn("Skipping invalid or incomplete field node:", node);
                    return false;
                }
                if (!(fieldInfo.name in fieldNextIds)) {
                    fieldNextIds[fieldInfo.name] = 0;
                }
                const fieldId = `${fieldInfo.name}_${fieldNextIds[fieldInfo.name]++}`;
                fieldNodes[fieldId] = fieldInfo;
                node.setAttribute("field_id", fieldId);
                if (fieldInfo.isHandle) {
                    handleField = fieldInfo.name;
                }
                columns.push({
                    ...fieldInfo,
                    id: `column_${nextId++}`,
                    className: node.getAttribute("class") || "",
                    optional: node.getAttribute("optional") || false,
                    type: "field",
                    hasLabel: !(archParseBoolean(fieldInfo.attrs.nolabel) || fieldInfo.field.noLabel),
                    label: fieldInfo.string || fieldInfo.name,
                });
            } else if (node.tagName === "groupby" && node.getAttribute("name")) {
                const fieldName = node.getAttribute("name");
                const relationModel = fields[fieldName]?.relation;
                if (!relationModel) {
                    console.warn(`GroupBy field ${fieldName} has no related model. Skipping.`);
                    return false;
                }
                const groupByArch = new XMLSerializer().serializeToString(node);
                const groupByArchInfo = groupListArchParser.parse(groupByArch, models, relationModel);
                groupBy.fields[fieldName] = groupByArchInfo.fields;
                groupBy.buttons[fieldName] = groupByArchInfo.buttons;
            } else if (node.tagName === "button") {
                const button = this.processButton(node);
                headerButtons.push(button);
            }
        });

        if (Object.keys(fieldNodes).length === 0) {
            console.error("No valid fields found in Gantt PS view. Parsed XML:", xmlDoc);
            throw new Error("Gantt PS view requires at least one valid field.");
        }

        return {
            creates,
            handleField,
            headerButtons,
            fieldNodes,
            widgetNodes,
            activeFields,
            columns,
            groupBy,
            xmlDoc,
            ...treeAttr,
        };
    }
}

