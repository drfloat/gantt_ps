from odoo import models, fields

class GanttPSModel(models.Model):
    _name = "gantt.ps"
    _description = "Gantt PS"

    name = fields.Char(string="Name")
    start_date = fields.Datetime(string="Start Date")
    end_date = fields.Datetime(string="End Date")

    def get_gantt_ps_default_options(self):
        # Default options for the Gantt view
        return {
            "zoomLevel": "day",
            "enableDragAndDrop": True,
        }

class View(models.Model):
    _inherit='ir.ui.view'
    type = fields.Selection(selection_add=[('gantt_ps',"GanttPS")])

class IrActionsActWindowView(models.Model):
    _inherit = 'ir.actions.act_window.view'
    view_mode= fields.Selection(selection_add=[('gantt_ps',"GanttPS")],ondelete={'gantt_ps':'cascade'})
