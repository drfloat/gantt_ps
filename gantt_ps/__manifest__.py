{
    'name': 'gantt_ps',
    'version': '1.0',
    'category': 'test',
    'author': 'pranav salunkhe',
    'application':True,
    'installable': True,
    'license': 'LGPL-3',
    'depends': ['sale', 'stock', 'account', 'website', 'portal','contacts'],
    'data': [
        'security/ir.model.access.csv',
        "views/simple_gantt.xml",
        "views/gantt_ps.xml",

    ],
    'assets':{
        'web.assets_backend':[
            'gantt_ps/static/src/js/gantt_ps_archparser.js',
            'gantt_ps/static/src/js/gantt_ps_controller.js',
            'gantt_ps/static/src/js/gantt_ps_renderer.js',
            'gantt_ps/static/src/js/gantt_ps_view.js',
            'gantt_ps/static/src/xml/gantt_ps_controller.xml',
            'gantt_ps/static/src/xml/gantt_ps_renderer.xml',
        ]
    }
}