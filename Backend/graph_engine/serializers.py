
from rest_framework import serializers


class GraphPositionSerializer(serializers.Serializer):
    x = serializers.FloatField()
    y = serializers.FloatField()


class GraphNodeSerializer(serializers.Serializer):
    id = serializers.CharField()
    type = serializers.CharField()
    position = GraphPositionSerializer()
    data = serializers.JSONField()


class GraphEdgeSerializer(serializers.Serializer):
    id = serializers.CharField()
    source = serializers.CharField()
    target = serializers.CharField()
    label = serializers.CharField(allow_blank=True, required=False)
    type = serializers.CharField(required=False)


class GraphMetadataSerializer(serializers.Serializer):
    total_nodes = serializers.IntegerField(required=False)
    total_edges = serializers.IntegerField(required=False)


class AccessGraphResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    nodes = GraphNodeSerializer(many=True)
    edges = GraphEdgeSerializer(many=True)
    metadata = serializers.JSONField(required=False)
