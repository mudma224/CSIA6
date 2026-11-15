"""Pydantic schemas for the private science service (contract v0.2)."""
from __future__ import annotations

from pathlib import Path
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

REPO_ROOT = Path(__file__).resolve().parents[3]

Zone = Literal["beni_amir", "beni_moussa", "other", "unsure"]
Irrigation = Literal["flood", "basin", "drip", "pivot", "sprinkler", "unknown"]

SeasonPattern = r"^\d{4}-\d{4}$"


class LocationInput(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)


class ParcelInput(BaseModel):
    zone: Zone
    area_ha: Optional[float] = Field(default=None, gt=0, le=1000)
    irrigation: Irrigation
    location: Optional[LocationInput] = None


class HistoryEntry(BaseModel):
    crop_id: str = Field(min_length=1, max_length=80)
    season: Optional[str] = Field(default=None, pattern=SeasonPattern)

    @field_validator("crop_id")
    @classmethod
    def strip_crop(cls, v: str) -> str:
        return v.strip()


class PrioritiesInput(BaseModel):
    water_saving: Optional[int] = Field(default=None, ge=0, le=3)
    soil_health: Optional[int] = Field(default=None, ge=0, le=3)
    market: Optional[int]   # no rule bound in v0.2 - recorded, documented note
    input_cost: Optional[int]
    yield_stability: Optional[int] = Field(default=None, ge=0, le=3)

    @field_validator("market", "input_cost")
    @classmethod
    def bound_check(cls, v):
        if v is not None and not 0 <= v <= 3:
            raise ValueError("priority values must be 0-3")
        return v


class BaselineInput(BaseModel):
    role: Literal["existing_strategy"]


class RecommendationsRequest(BaseModel):
    contract_version: Optional[Literal["0.2"]] = None
    parcel: ParcelInput
    history: list[HistoryEntry] = Field(default=[], max_length=3)
    planned_season: Optional[str] = Field(default=None, pattern=SeasonPattern)
    farmer_priorities: Optional[PrioritiesInput] = None
    baseline: Optional[BaselineInput] = None

    @model_validator(mode="after")
    def check_consecutive_seasons(self):
        seasons = [e.season for e in self.history if e.season is not None]
        if self.planned_season:
            seasons.append(self.planned_season)
        for s in seasons:
            a, b = s[:4], s[5:]
            if not a.isdigit() or not b.isdigit() or int(a) + 1 != int(b):
                raise ValueError("season must be consecutive campaign years YYYY-YYYY")
        return self
