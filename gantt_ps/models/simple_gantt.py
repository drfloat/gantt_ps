from odoo import fields , models

class SimpleGantt(models.Model):
    _name = "simple.gantt"


    name = fields.Char(string='Name')
    start_date = fields.Date('Start Date')
    end_date = fields.Date('End Date')

