import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { StagesModule } from './stages/stages.module';
import { TeamsModule } from './teams/teams.module';
import { MatchesModule } from './matches/matches.module';
import { PredictionsModule } from './predictions/predictions.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [AuthModule, UsersModule, TournamentsModule, StagesModule, TeamsModule, MatchesModule, PredictionsModule, LeaderboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
