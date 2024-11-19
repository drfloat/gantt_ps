/** @odoo-module **/
import {_lt} from "@web/core/l10n/translation";
import { RelationalModel } from "@web/model/relational_model/relational_model";
import { registry } from "@web/core/registry";
import {GanttPsRenderer} from "./gantt_ps_renderer";
import { GanttPSController} from "./gantt_ps_controller";
import { GanttPSArchParser} from "./gantt_ps_archparser";
//import { GanttRelationalModel } from "./gantt_ps_relational_model";

export const gantt_ps_view = {
    type: "gantt_ps",
    display_name: _lt("GanttPs"),
    icon: "fa fa-tasks",
    multiRecord:true,
    Controller: GanttPSController,
    Renderer: GanttPsRenderer,
    ArchParser: GanttPSArchParser,
    Model: RelationalModel,
    /**
     * Function that returns the props for the grid view.
     * @param {object} genericProps - Generic properties of the view.
     * @param {object} view - The view object.
     * @returns {object} Props for the grid view.
     */
    props: (genericProps, view) => {
        const {
            ArchParser,
            Model,
            Renderer
        } = view;
        const {
            arch,
            relatedModels,
            resModel
        } = genericProps;
        const archInfo = new ArchParser().parse(arch, relatedModels, resModel);
        return {
            ...genericProps,
            archInfo,
            Model: view.Model,
            Renderer,
        };
    }
};
// Register the grid view configuration
registry.category("views").add("gantt_ps", gantt_ps_view);
