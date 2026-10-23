import uuid

from django.db import models


class Lead(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20)
    email = models.EmailField(max_length=254)
    source = models.CharField(max_length=40, default="property_page", editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["name"], name="lead_name_idx")]

    def __str__(self) -> str:
        return f"{self.name} <{self.email}>"
