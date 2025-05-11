from django.db import models
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel

from rasengan.graph.enums import NodeType, MemoryLevel, GraphType
from susanoo.core.behaviours import UUIDMixin, StatusMixin
from susanoo.message.enums import SentinelType
from susanoo.provider.models import LLM, LLMConfig
from susanoo.stage.models import Stage, StageV2


class Node(UUIDMixin, StatusMixin, TimeStampedModel):
    ## TODO: Node should not care about stage, it should have an executable
    stage = models.ForeignKey(Stage, on_delete=models.SET_NULL, blank=True, null=True, related_name='stage_nodes')
    type = models.CharField(_('Type'), max_length=15, choices=NodeType.choices, blank=True, null=True)
    memory_level = models.CharField(_('Memory Level'), max_length=10, choices=MemoryLevel.choices, blank=True,
                                    null=True)
    llm = models.ForeignKey(LLM, on_delete=models.SET_NULL, blank=True, null=True, related_name='llm_nodes')
    llm_config = models.ForeignKey(LLMConfig, on_delete=models.SET_NULL, blank=True, null=True,
                                   related_name='llm_config_nodes')

    # prompt = models.TextField(_('Prompt'), blank=True, null=True)

    def __str__(self):
        if self.stage:
            return f'{self.stage.type}-{self.stage.stage_id}:{self.type}'
        return f'{self.type}'


class NodeV2(UUIDMixin, StatusMixin, TimeStampedModel):
    stage = models.ForeignKey(StageV2, on_delete=models.SET_NULL, blank=True, null=True, related_name='stage_nodes_v2')
    type = models.CharField(_('Type'), max_length=15, choices=NodeType.choices, blank=True, null=True)
    llm = models.ForeignKey(LLM, on_delete=models.SET_NULL, blank=True, null=True, related_name='llm_nodes_v2')
    llm_config = models.ForeignKey(LLMConfig, on_delete=models.SET_NULL, blank=True, null=True,
                                   related_name='llm_config_nodes_v2')
    prompt = models.ForeignKey('graph.Prompt', on_delete=models.SET_NULL, blank=True, null=True,
                               related_name='prompt_nodes_v2')
    timeout = models.BigIntegerField(_('Timeout'), blank=True, null=True)
    sentinel_type = models.CharField(_('Type'), max_length=50, choices=SentinelType.choices, blank=True, null=True)
    max_repeat = models.IntegerField(_('Max Repeat at once'), blank=True,
                                     null=True)  ## maximum number of time this node is allowed to change without moving to next
    memory_nodes = models.ManyToManyField('graph.NodeV2', blank=True, null=True,
                                          related_name='node_memory')  ## provide converstaion history from these nodes

    # memory_depth = models.IntegerField(_('Memory Depth (cycles)'), default=1)  ## how many historical cycles to provide from memory nodes
    # memory_per_depth = models.IntegerField(_('Memory per Depth'), default=-1)  ## how many from each cycle to take

    def __str__(self):
        if self.stage:
            return f'{self.stage.type}:{self.stage.stage_id}:{self.type}:{self.id}'
        return f'{self.type}:{self.id}'


class Edge(UUIDMixin, StatusMixin, TimeStampedModel):
    start_node = models.ForeignKey(Node, on_delete=models.CASCADE, blank=True, null=True,
                                   related_name='node_start_edges')
    end_node = models.ForeignKey(Node, on_delete=models.CASCADE, blank=True, null=True, related_name='node_end_edges')

    class Meta:
        unique_together = (
            ('start_node', 'end_node')
        )

    def __str__(self):
        return f'{self.start_node.__str__()} -> {self.end_node.__str__()}'


class EdgeV2(UUIDMixin, StatusMixin, TimeStampedModel):
    start_node = models.ForeignKey(NodeV2, on_delete=models.CASCADE, blank=True, null=True,
                                   related_name='node_start_edges_v2')
    end_node = models.ForeignKey(NodeV2, on_delete=models.CASCADE, blank=True, null=True,
                                 related_name='node_end_edges_v2')

    class Meta:
        unique_together = (
            ('start_node', 'end_node')
        )

    def __str__(self):
        return f'{self.start_node.__str__()} -> {self.end_node.__str__()}'


class ForceEdge(UUIDMixin, StatusMixin, TimeStampedModel):
    start_node = models.ForeignKey(NodeV2, on_delete=models.CASCADE, blank=True, null=True,
                                   related_name='node_start_force_edges')
    end_node = models.ForeignKey(NodeV2, on_delete=models.CASCADE, blank=True, null=True,
                                 related_name='node_end_force_edges')

    class Meta:
        unique_together = (
            ('start_node', 'end_node')
        )

    def __str__(self):
        return f'{self.start_node} -> {self.end_node}'


class ConditionalEdge(UUIDMixin, StatusMixin, TimeStampedModel):
    start_node = models.ForeignKey(Node, on_delete=models.CASCADE, blank=True, null=True,
                                   related_name='conditional_node_start_edges')
    end_node = models.ForeignKey(Node, on_delete=models.CASCADE, blank=True, null=True,
                                 related_name='conditional_node_end_edges')
    condition = models.CharField(_('Condition (Output of Start node)'), max_length=10, blank=True, null=True)

    class Meta:
        unique_together = (
            ('start_node', 'end_node', 'condition')
        )

    def __str__(self):
        return f'{self.start_node.__str__()} - {self.condition} -> {self.end_node.__str__()}'


class ConditionalEdgeV2(UUIDMixin, StatusMixin, TimeStampedModel):
    start_node = models.ForeignKey(NodeV2, on_delete=models.CASCADE, blank=True, null=True,
                                   related_name='conditional_node_start_edges_v2')
    end_node = models.ForeignKey(NodeV2, on_delete=models.CASCADE, blank=True, null=True,
                                 related_name='conditional_node_end_edges_v2')
    condition = models.CharField(_('Condition (Output of Start node)'), max_length=10, blank=True, null=True)

    class Meta:
        unique_together = (
            ('start_node', 'end_node', 'condition')
        )

    def __str__(self):
        return f'{self.start_node.__str__()} - {self.condition} -> {self.end_node.__str__()}'


class Graph(UUIDMixin, StatusMixin, TimeStampedModel):
    start_node = models.ForeignKey(Node, on_delete=models.CASCADE, blank=True, null=True, related_name='graph_start')
    end_node = models.ForeignKey(Node, on_delete=models.CASCADE, blank=True, null=True, related_name='graph_end')
    edges = models.ManyToManyField(Edge, blank=True, null=True, related_name='edge_graphs')
    conditional_edges = models.ManyToManyField(ConditionalEdge, blank=True, null=True,
                                               related_name='conditional_edge_graphs')

    def __str__(self):
        return str(self.id)


class GraphV2(UUIDMixin, StatusMixin, TimeStampedModel):
    type = models.CharField(_('Graph Type'), max_length=10, choices=GraphType.choices, blank=True, null=True)
    start_node = models.ForeignKey(NodeV2, on_delete=models.CASCADE, blank=True, null=True,
                                   related_name='graph_start_v2')
    end_node = models.ForeignKey(NodeV2, on_delete=models.CASCADE, blank=True, null=True, related_name='graph_end_v2')
    edges = models.ManyToManyField(EdgeV2, blank=True, null=True, related_name='edge_graphs_v2')
    force_edges = models.ManyToManyField(ForceEdge, blank=True, null=True, related_name='force_edge_graphs')
    conditional_edges = models.ManyToManyField(ConditionalEdgeV2, blank=True, null=True,
                                               related_name='conditional_edge_graphs_v2')

    def __str__(self):
        return str(self.id)


class Prompt(UUIDMixin, StatusMixin, TimeStampedModel):
    code = models.CharField(_('Code'), max_length=100, blank=True, null=True)
    type = models.CharField(_('Type'), max_length=10, choices=GraphType.choices, blank=True, null=True)
    prompt = models.TextField(_('Prompt'), blank=True, null=True)

    class Meta:
        unique_together = (
            ('code', 'type')
        )

    def __str__(self):
        return f'{self.type}:{self.code}'
