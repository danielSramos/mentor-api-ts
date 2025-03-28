export type AccountProps = {
  id: string;
  name: string;
  email: string;
  username?: string;
  password: string;
  company?: string;
  position?: string;
  nationality?: string;
  verified?: boolean;
  description?: string;
  profileImgUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  userProfile?: string;
  userPhoneNumber?: string;
  skills?: Array<{
    id: string;
    name: string;
    userId: string;
    knowledgeAreaId: string;
  }>;
  knowledgeAreas?: string;
  reviews?: string;
  mentoringPlans?: string;
  mentorings?: string;
  mentoringClients?: string;
};

export class AccountEntity {
  constructor(private readonly props: AccountProps) {}

  toJson() {
    return {
      ...this.props,
    };
  }

  get id() {
    return this.props.id;
  }

  set name(name: string) {
    this.props.name = name;
  }

  set email(email: string) {
    this.props.email = email;
  }

  set username(username: string) {
    this.props.username = username;
  }

  set password(password: string) {
    this.props.password = password;
  }

  set company(company: string) {
    this.props.company = company;
  }

  set position(position: string) {
    this.props.position = position;
  }

  set nationality(nationality: string) {
    this.props.nationality = nationality;
  }

  set verified(verified: boolean) {
    this.props.verified = verified;
  }

  set description(description: string) {
    this.props.description = description;
  }

  set profileImgUrl(profileImgUrl: string) {
    this.props.profileImgUrl = profileImgUrl;
  }

  set createdAt(createdAt: string) {
    this.props.createdAt = createdAt;
  }

  set updatedAt(updatedAt: string) {
    this.props.updatedAt = updatedAt;
  }

  set userProfile(userProfile: string) {
    this.props.userProfile = userProfile;
  }

  set userPhoneNumber(userPhoneNumber: string) {
    this.props.userPhoneNumber = userPhoneNumber;
  }

  set skills(
    skills: Array<{
      id: string;
      name: string;
      userId: string;
      knowledgeAreaId: string;
    }>,
  ) {
    this.props.skills = skills;
  }

  set knowledgeAreas(knowledgeAreas: string) {
    this.props.knowledgeAreas = knowledgeAreas;
  }

  set reviews(reviews: string) {
    this.props.reviews = reviews;
  }

  set mentoringPlans(mentoringPlans: string) {
    this.props.mentoringPlans = mentoringPlans;
  }

  set mentorings(mentorings: string) {
    this.props.mentorings = mentorings;
  }

  set mentoringClients(mentoringClients: string) {
    this.props.mentoringClients = mentoringClients;
  }
}
