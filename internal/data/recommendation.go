package data

import (
	"time"

	"github.com/wraith29/apollo/internal/model"
	"gorm.io/gorm"
)

func SaveRecommendation(db *gorm.DB, recommendation *recommendedAlbum) error {
	rec := model.Recommendation{
		AlbumId: recommendation.Id,
		Date:    time.Now(),
	}

	db.Create(&rec)

	return db.Error
}

func GetLatestRecommendation(db *gorm.DB) (*model.Recommendation, error) {
	var rec model.Recommendation

	exists := 0

	db.Raw("SELECT EXISTS (SELECT 1 FROM `recommendation`)").Scan(&exists)

	if exists == 0 {
		return nil, db.Error
	}

	db.Last(&rec)

	return &rec, db.Error
}

func IsLatestRecommendationRated(db *gorm.DB) (bool, error) {
	latestRec, err := GetLatestRecommendation(db)
	if err != nil || latestRec == nil {
		return true, err
	}

	return latestRec.Rated, nil
}

type recommendationListModel struct {
	Id        uint
	Date      time.Time
	Rated     bool
	Rating    int
	AlbumName string
}

func GetRecommendations(db *gorm.DB, listAll bool) (model.ListResult[recommendationListModel], error) {
	recommendations := make([]recommendationListModel, 0)

	var count int
	db.Raw("SELECT COUNT(id) FROM recommendation").Scan(&count)

	query := db.Table("recommendation R").
		Select("R.`id`, R.`date`, R.`rated`, A.`rating`, A.`name` AS album_name").
		InnerJoins("INNER JOIN album A ON A.`id` = R.`album_id`").
		Order("R.`id` DESC")

	if !listAll {
		query.Limit(10)
	}

	query.Find(&recommendations)

	return model.ListResult[recommendationListModel]{
		Count:   count,
		Results: recommendations,
	}, db.Error
}
