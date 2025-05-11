from django.contrib import admin
from rasengan.graph.models import Node, Edge, ConditionalEdge, Graph, NodeV2, EdgeV2, ConditionalEdgeV2, GraphV2, \
    Prompt, ForceEdge


@admin.register(Node)
class NodeAdmin(admin.ModelAdmin):
    model = Node
    list_display = ('id', 'stage', 'type', 'memory_level', 'temperature')
    list_filter = ('type',)
    ordering = ('-created', '-modified')

    @admin.display(ordering='temperature')
    def temperature(self, obj):
        if obj.llm_config:
            return obj.llm_config.temperature
        return None


@admin.register(NodeV2)
class NodeV2Admin(admin.ModelAdmin):
    model = NodeV2
    list_display = ('id', 'stage', 'type', 'temperature')
    list_filter = ('type',)
    ordering = ('-created', '-modified')

    @admin.display(ordering='temperature')
    def temperature(self, obj):
        if obj.llm_config:
            return obj.llm_config.temperature
        return None


@admin.register(Edge)
class EdgeAdmin(admin.ModelAdmin):
    model = Edge
    list_display = ('id', 'start_node', 'end_node')
    ordering = ('-created', '-modified')


@admin.register(EdgeV2)
class EdgeV2Admin(admin.ModelAdmin):
    model = EdgeV2
    list_display = ('id', 'start_node', 'end_node')
    ordering = ('-created', '-modified')


@admin.register(ForceEdge)
class EdgeV2Admin(admin.ModelAdmin):
    model = ForceEdge
    list_display = ('id', 'start_node', 'end_node')
    ordering = ('-created', '-modified')


@admin.register(ConditionalEdge)
class ConditionalEdgeAdmin(admin.ModelAdmin):
    model = ConditionalEdge
    list_display = ('id', 'start_node', 'end_node')
    ordering = ('-created', '-modified')


@admin.register(ConditionalEdgeV2)
class ConditionalEdgeV2Admin(admin.ModelAdmin):
    model = ConditionalEdgeV2
    list_display = ('id', 'start_node', 'end_node')
    ordering = ('-created', '-modified')


@admin.register(Graph)
class GraphAdmin(admin.ModelAdmin):
    model = Graph
    list_display = ('id',)
    ordering = ('-created', '-modified')


@admin.register(GraphV2)
class GraphV2Admin(admin.ModelAdmin):
    model = GraphV2
    list_display = ('id',)
    ordering = ('-created', '-modified')


@admin.register(Prompt)
class PromptAdmin(admin.ModelAdmin):
    model = Prompt
    list_display = ('id', 'code')
    ordering = ('-created', '-modified')
