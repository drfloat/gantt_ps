/** @odoo-module **/

import { Component, useState, onMounted } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { ViewScaleSelector } from "@web/views/view_components/view_scale_selector";

export class GanttPsRenderer extends Component {
    setup() {
        this.state = useState({
            options: null,
            currentWindow: {
                start: new Date(),
                end: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        this.rpc = useService("rpc");

        console.log("Renderer props:", this.props);

        // Fetch default options from the backend
        this.loadDefaultOptions();
    }

    async loadDefaultOptions() {
        try {
            const options = await this.rpc({
                model: this.props.modelName,
                method: "get_gantt_ca_default_options",
                args: [[]],
                context: this.props.context,
            });
            console.log("Loaded options:", options);
            this.state.options = options;
        } catch (error) {
            console.error("Failed to load default options:", error);
        }
    }

    onMounted() {
        if (!this.props.dateStart) {
            console.error("Missing 'date_start' in props:", this.props);
            throw new Error("Gantt PS view requires a 'date_start' attribute.");
        }
    }
}

GanttPsRenderer.template = "gantt_ps_view.GanttPsRenderer";
GanttPsRenderer.components = { ViewScaleSelector };

