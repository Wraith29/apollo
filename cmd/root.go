package cmd

import (
	"path"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/wraith29/apollo/cmd/list"
	"github.com/wraith29/apollo/internal/storage"
)

var rootCmd = &cobra.Command{
	Use:     "apollo",
	Short:   "Apollo is a music management and recommendation software",
	Version: "1.0.0",
}

func initConfig() error {
	storageDir, err := storage.GetStorageDir()
	if err != nil {
		return err
	}
	if err = storage.MkdirIfNotExists(storageDir); err != nil {
		return err
	}

	if err = storage.CreateIfNotExists(path.Join(storageDir, "apollo.db")); err != nil {
		return err
	}

	viper.SetConfigName("config")
	viper.SetConfigType("toml")
	viper.AddConfigPath(storageDir)

	viper.SetDefault("database-uri", path.Join(storageDir, "apollo.db"))
	viper.SetDefault("ignore-with-secondary-types", true)

	err = viper.ReadInConfig()
	if _, ok := err.(viper.ConfigFileNotFoundError); ok {
		if err = viper.SafeWriteConfig(); err != nil {
			return err
		}
	}

	return nil
}

func init() {
	if err := initConfig(); err != nil {
		panic(err)
	}

	rootCmd.AddCommand(addCmd)
	rootCmd.AddCommand(recCmd)
	rootCmd.AddCommand(rateCmd)
	rootCmd.AddCommand(removeCmd)
	rootCmd.AddCommand(list.ListCmd)
}

func Execute() error {
	return rootCmd.Execute()
}
